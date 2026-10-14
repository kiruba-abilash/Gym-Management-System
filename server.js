const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const session = require("express-session");

const app = express();

app.use(session({
    secret: "gym-management-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true
    }
}));

app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// MySQL connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "MyNewPass@123",
    database: "gym_management",
    port: 3306
});

// Connect MySQL
db.connect((err) => {
    if (err) {
        console.log("MySQL connection failed:", err.message);
    } else {
        console.log("MySQL Database Connected Successfully!");
    }
});

app.get("/api/session", (req, res) => {
    if (req.session.user) {
        return res.json({
            loggedIn: true,
            user: req.session.user
        });
    }

    res.status(401).json({
        loggedIn: false
    });
});

function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({
            message: "Please login first"
        });
    }

    next();
}

app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                message: "Logout failed"
            });
        }

        res.json({
            message: "Logout successful"
        });
    });
});

// Login API
app.post("/api/login", async (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    const sql = "SELECT * FROM users WHERE username = ?";

    db.query(sql, [username], async (err, results) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                message: "Database error"
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }

        const user = results[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }

        req.session.user = {
    id: user.id,
    username: user.username,
    role: user.role
};

        res.json({
            message: "Login successful!",
            username: user.username,
            role: user.role
        });
    });
});

app.get("/api/dashboard", requireLogin, (req, res) => {

    const sql = `
        SELECT
            (SELECT COUNT(*) FROM members) AS totalMembers,
            (SELECT COUNT(*) FROM trainers) AS totalTrainers,
            (SELECT COUNT(*) FROM packages) AS totalPackages,
            (SELECT COUNT(*) FROM memberships) AS totalMemberships,
            (SELECT COUNT(*) FROM attendance) AS totalAttendance,
            (SELECT COUNT(*) FROM payments) AS totalPayments
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.log("Dashboard error:", err);

            return res.status(500).json({
                message: "Failed to load dashboard data"
            });
        }

        res.json(results[0]);
    });
});

// Get all members
app.get("/api/members", requireLogin, (req, res) => {

    const sql = "SELECT * FROM members ORDER BY id DESC";

    db.query(sql, (err, results) => {

        if (err) {
            console.log("Get members error:", err);

            return res.status(500).json({
                message: "Failed to get members"
            });
        }

        res.json(results);
    });
});

// Add new member
app.post("/api/members", requireLogin, (req, res) => {

    const {
        name,
        phone,
        email,
        gender,
        date_of_birth
    } = req.body;

    if (!name) {
        return res.status(400).json({
            message: "Name is required"
        });
    }
    const phonePattern = /^[0-9]{10}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!phonePattern.test(phone)) {
    return res.status(400).json({
        message: "Phone number must contain exactly 10 digits"
    });
}

if (!emailPattern.test(email)) {
    return res.status(400).json({
        message: "Please enter a valid email address"
    });
}

    const sql = `
        INSERT INTO members
        (name, phone, email, gender, date_of_birth)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [name, phone, email, gender, date_of_birth],
        (err, result) => {

            if (err) {
                console.log("Add member error:", err);

                return res.status(500).json({
                    message: "Failed to add member"
                });
            }

            res.status(201).json({
                message: "Member added successfully",
                memberId: result.insertId
            });
        }
    );
});

// Delete member
app.delete("/api/members/:id", requireLogin, (req, res) => {

    const { id } = req.params;

    const sql = "DELETE FROM members WHERE id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.log("Delete member error:", err);

            return res.status(500).json({
                message: "Failed to delete member"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Member not found"
            });
        }

        res.json({
            message: "Member deleted successfully"
        });
    });
});

// Update member
app.put("/api/members/:id", requireLogin, (req, res) => {

    const { id } = req.params;

    const {
        name,
        phone,
        email,
        gender,
        date_of_birth
    } = req.body;

    if (!name) {
        return res.status(400).json({
            message: "Name is required"
        });
    }

    const sql = `
        UPDATE members
        SET name = ?,
            phone = ?,
            email = ?,
            gender = ?,
            date_of_birth = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [name, phone, email, gender, date_of_birth, id],
        (err, result) => {

            if (err) {
                console.log("Update member error:", err);

                return res.status(500).json({
                    message: "Failed to update member"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Member not found"
                });
            }

            res.json({
                message: "Member updated successfully"
            });
        }
    );
});

// Get all trainers
app.get("/api/trainers", requireLogin, (req, res) => {

    const sql = "SELECT * FROM trainers ORDER BY id DESC";

    db.query(sql, (err, results) => {

        if (err) {
            console.log("Get trainers error:", err);

            return res.status(500).json({
                message: "Failed to get trainers"
            });
        }

        res.json(results);
    });
});

// Add new trainer
app.post("/api/trainers", requireLogin, (req, res) => {

    const {
        name,
        phone,
        specialization,
        salary
    } = req.body;

    if (!name) {
        return res.status(400).json({
            message: "Trainer name is required"
        });
    }
    const phonePattern = /^[0-9]{10}$/;

if (!phonePattern.test(phone)) {
    return res.status(400).json({
        message: "Phone number must contain exactly 10 digits"
    });
}

    const sql = `
        INSERT INTO trainers
        (name, phone, specialization, salary)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [name, phone, specialization, salary],
        (err, result) => {

            if (err) {
                console.log("Add trainer error:", err);

                return res.status(500).json({
                    message: "Failed to add trainer"
                });
            }

            res.status(201).json({
                message: "Trainer added successfully",
                trainerId: result.insertId
            });
        }
    );
});

// Delete trainer
app.delete("/api/trainers/:id", requireLogin, (req, res) => {

    const { id } = req.params;

    const sql = "DELETE FROM trainers WHERE id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.log("Delete trainer error:", err);

            return res.status(500).json({
                message: "Failed to delete trainer"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Trainer not found"
            });
        }

        res.json({
            message: "Trainer deleted successfully"
        });
    });
});

// Update trainer
app.put("/api/trainers/:id", requireLogin, (req, res) => {

    const { id } = req.params;

    const {
        name,
        phone,
        specialization,
        salary
    } = req.body;

    if (!name) {
        return res.status(400).json({
            message: "Trainer name is required"
        });
    }

    const sql = `
        UPDATE trainers
        SET name = ?,
            phone = ?,
            specialization = ?,
            salary = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [name, phone, specialization, salary, id],
        (err, result) => {

            if (err) {
                console.log("Update trainer error:", err);

                return res.status(500).json({
                    message: "Failed to update trainer"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Trainer not found"
                });
            }

            res.json({
                message: "Trainer updated successfully"
            });
        }
    );
});

// Get all packages
app.get("/api/packages", requireLogin, (req, res) => {

    const sql = "SELECT * FROM packages ORDER BY id DESC";

    db.query(sql, (err, results) => {

        if (err) {
            console.log("Get packages error:", err);

            return res.status(500).json({
                message: "Failed to get packages"
            });
        }

        res.json(results);
    });
});

// Add new package
app.post("/api/packages", requireLogin, (req, res) => {

    const {
        package_name,
        duration,
        price
    } = req.body;

    if (!package_name || !duration || !price) {
        return res.status(400).json({
            message: "Package name, duration and price are required"
        });
    }
    if (duration <= 0) {
    return res.status(400).json({
        message: "Duration must be greater than 0"
    });
}

if (price <= 0) {
    return res.status(400).json({
        message: "Price must be greater than 0"
    });
}

    const sql = `
        INSERT INTO packages
        (package_name, duration, price)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [package_name, duration, price],
        (err, result) => {

            if (err) {
                console.log("Add package error:", err);

                return res.status(500).json({
                    message: "Failed to add package"
                });
            }

            res.status(201).json({
                message: "Package added successfully",
                packageId: result.insertId
            });
        }
    );
});

// Delete package
app.delete("/api/packages/:id", requireLogin, (req, res) => {

    const { id } = req.params;

    const sql = "DELETE FROM packages WHERE id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.log("Delete package error:", err);

            return res.status(500).json({
                message: "Failed to delete package"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Package not found"
            });
        }

        res.json({
            message: "Package deleted successfully"
        });
    });
});

// Update package
app.put("/api/packages/:id", requireLogin, (req, res) => {

    const { id } = req.params;

    const {
        package_name,
        duration,
        price
    } = req.body;

    if (!package_name || !duration || !price) {
        return res.status(400).json({
            message: "Package name, duration and price are required"
        });
    }

    const sql = `
        UPDATE packages
        SET package_name = ?,
            duration = ?,
            price = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [package_name, duration, price, id],
        (err, result) => {

            if (err) {
                console.log("Update package error:", err);

                return res.status(500).json({
                    message: "Failed to update package"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Package not found"
                });
            }

            res.json({
                message: "Package updated successfully"
            });
        }
    );
});

// Get all memberships
app.get("/api/memberships", requireLogin, (req, res) => {

    const sql = `
        SELECT
            memberships.id,
            memberships.member_id,
            memberships.package_id,
            memberships.start_date,
            memberships.end_date,
            memberships.status,
            members.name AS member_name,
            packages.package_name
        FROM memberships
        JOIN members ON memberships.member_id = members.id
        JOIN packages ON memberships.package_id = packages.id
        ORDER BY memberships.id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.log("Get memberships error:", err);

            return res.status(500).json({
                message: "Failed to get memberships"
            });
        }

        res.json(results);
    });
});

// Add new membership
app.post("/api/memberships", requireLogin, (req, res) => {

    const {
        member_id,
        package_id,
        start_date,
        end_date,
        status
    } = req.body;

    if (!member_id || !package_id || !start_date || !end_date) {
        return res.status(400).json({
            message: "Member, package, start date and end date are required"
        });
    }
    if (end_date < start_date) {
    return res.status(400).json({
        message: "End date cannot be before start date"
    });
}

    const sql = `
        INSERT INTO memberships
        (member_id, package_id, start_date, end_date, status)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [member_id, package_id, start_date, end_date, status || "Active"],
        (err, result) => {

            if (err) {
                console.log("Add membership error:", err);

                return res.status(500).json({
                    message: "Failed to add membership"
                });
            }

            res.status(201).json({
                message: "Membership added successfully",
                membershipId: result.insertId
            });
        }
    );
});

// Delete membership
app.delete("/api/memberships/:id", requireLogin, (req, res) => {

    const { id } = req.params;

    const sql = "DELETE FROM memberships WHERE id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.log("Delete membership error:", err);

            return res.status(500).json({
                message: "Failed to delete membership"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Membership not found"
            });
        }

        res.json({
            message: "Membership deleted successfully"
        });
    });
});

// Update membership
app.put("/api/memberships/:id", requireLogin, (req, res) => {

    const { id } = req.params;

    const {
        start_date,
        end_date,
        status
    } = req.body;

    if (!start_date || !end_date || !status) {
        return res.status(400).json({
            message: "Start date, end date and status are required"
        });
    }

    const sql = `
        UPDATE memberships
        SET start_date = ?,
            end_date = ?,
            status = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [start_date, end_date, status, id],
        (err, result) => {

            if (err) {
                console.log("Update membership error:", err);

                return res.status(500).json({
                    message: "Failed to update membership"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Membership not found"
                });
            }

            res.json({
                message: "Membership updated successfully"
            });
        }
    );
});

// Get all attendance records
app.get("/api/attendance", requireLogin, (req, res) => {

    const sql = `
        SELECT
            attendance.id,
            attendance.member_id,
            attendance.attendance_date,
            attendance.check_in_time,
            members.name AS member_name
        FROM attendance
        JOIN members ON attendance.member_id = members.id
        ORDER BY attendance.id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.log("Get attendance error:", err);

            return res.status(500).json({
                message: "Failed to get attendance records"
            });
        }

        res.json(results);
    });
});

// Add attendance
app.post("/api/attendance", requireLogin, (req, res) => {

    const {
        member_id,
        attendance_date,
        check_in_time
    } = req.body;

    if (!member_id || !attendance_date || !check_in_time) {
        return res.status(400).json({
            message: "Member, date and check-in time are required"
        });
    }

    const checkSql = `
        SELECT id
        FROM attendance
        WHERE member_id = ? AND attendance_date = ?
    `;

    db.query(
        checkSql,
        [member_id, attendance_date],
        (checkErr, rows) => {

            if (checkErr) {
                console.log("Check attendance error:", checkErr);

                return res.status(500).json({
                    message: "Failed to check attendance"
                });
            }

            if (rows.length > 0) {
                return res.status(400).json({
                    message: "Attendance already marked for this member today"
                });
            }

            const sql = `
                INSERT INTO attendance
                (member_id, attendance_date, check_in_time)
                VALUES (?, ?, ?)
            `;

            db.query(
                sql,
                [member_id, attendance_date, check_in_time],
                (err, result) => {

                    if (err) {
                        console.log("Add attendance error:", err);

                        return res.status(500).json({
                            message: "Failed to add attendance"
                        });
                    }

                    res.status(201).json({
                        message: "Attendance marked successfully",
                        attendanceId: result.insertId
                    });
                }
            );
        }
    );
});

// Delete attendance
app.delete("/api/attendance/:id", requireLogin, (req, res) => {

    const { id } = req.params;

    const sql = "DELETE FROM attendance WHERE id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.log("Delete attendance error:", err);

            return res.status(500).json({
                message: "Failed to delete attendance"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Attendance record not found"
            });
        }

        res.json({
            message: "Attendance deleted successfully"
        });
    });
});

// Get all payments
app.get("/api/payments", requireLogin, (req, res) => {

    const sql = `
        SELECT
            payments.id,
            payments.member_id,
            payments.amount,
            payments.payment_date,
            payments.payment_method,
            members.name AS member_name
        FROM payments
        JOIN members ON payments.member_id = members.id
        ORDER BY payments.id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.log("Get payments error:", err);

            return res.status(500).json({
                message: "Failed to get payments"
            });
        }

        res.json(results);
    });
});

// Delete payment
app.delete("/api/payments/:id", requireLogin, (req, res) => {

    const { id } = req.params;

    const sql = "DELETE FROM payments WHERE id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.log("Delete payment error:", err);

            return res.status(500).json({
                message: "Failed to delete payment"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Payment not found"
            });
        }

        res.json({
            message: "Payment deleted successfully"
        });
    });
});

// Add payment
app.post("/api/payments", requireLogin, (req, res) => {

    const {
        member_id,
        amount,
        payment_date,
        payment_method
    } = req.body;

    if (amount <= 0) {
    return res.status(400).json({
        message: "Payment amount must be greater than 0"
    });
}

    if (!member_id || !amount || !payment_date || !payment_method) {
        return res.status(400).json({
            message: "Member, amount, payment date and payment method are required"
        });
    }

    const sql = `
        INSERT INTO payments
        (member_id, amount, payment_date, payment_method)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [member_id, amount, payment_date, payment_method],
        (err, result) => {

            if (err) {
                console.log("Add payment error:", err);

                return res.status(500).json({
                    message: "Failed to add payment"
                });
            }

            res.status(201).json({
                message: "Payment added successfully",
                paymentId: result.insertId
            });
        }
    );
});

// Add payment
app.post("/api/payments", (req, res) => {

    const {
        member_id,
        amount,
        payment_date,
        payment_method
    } = req.body;

    if (!member_id || !amount || !payment_date || !payment_method) {
        return res.status(400).json({
            message: "Member, amount, payment date and payment method are required"
        });
    }

    const sql = `
        INSERT INTO payments
        (member_id, amount, payment_date, payment_method)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [member_id, amount, payment_date, payment_method],
        (err, result) => {

            if (err) {
                console.log("Add payment error:", err);

                return res.status(500).json({
                    message: "Failed to add payment"
                });
            }

            res.status(201).json({
                message: "Payment added successfully",
                paymentId: result.insertId
            });
        }
    );
});

// Reports API
app.get("/api/reports", requireLogin, (req, res) => {

    const countSql = `
        SELECT
            (SELECT COUNT(*) FROM members) AS totalMembers,
            (SELECT COUNT(*) FROM trainers) AS totalTrainers,
            (SELECT COUNT(*) FROM packages) AS totalPackages,
            (SELECT COUNT(*) FROM memberships) AS totalMemberships,
            (SELECT COUNT(*) FROM attendance) AS totalAttendance,
            (SELECT COUNT(*) FROM payments) AS totalPayments,
            (SELECT COALESCE(SUM(amount), 0) FROM payments) AS totalRevenue
    `;

    const paymentSql = `
        SELECT
            payments.id,
            members.name AS member_name,
            payments.amount,
            payments.payment_date,
            payments.payment_method
        FROM payments
        JOIN members
            ON payments.member_id = members.id
        ORDER BY payments.id DESC
    `;

    const attendanceSql = `
        SELECT
            attendance.id,
            members.name AS member_name,
            attendance.attendance_date,
            attendance.check_in_time
        FROM attendance
        JOIN members
            ON attendance.member_id = members.id
        ORDER BY attendance.id DESC
    `;


    db.query(countSql, (err, countResults) => {

        if (err) {
            console.log("Reports count error:", err);

            return res.status(500).json({
                message: "Failed to load report counts"
            });
        }


        db.query(paymentSql, (err, paymentResults) => {

            if (err) {
                console.log("Payment report error:", err);

                return res.status(500).json({
                    message: "Failed to load payment report"
                });
            }


            db.query(attendanceSql, (err, attendanceResults) => {

                if (err) {
                    console.log("Attendance report error:", err);

                    return res.status(500).json({
                        message: "Failed to load attendance report"
                    });
                }


                const report = countResults[0];

                res.json({

                    totalMembers: report.totalMembers,

                    totalTrainers: report.totalTrainers,

                    totalPackages: report.totalPackages,

                    totalMemberships: report.totalMemberships,

                    totalAttendance: report.totalAttendance,

                    totalPayments: report.totalPayments,

                    totalRevenue: report.totalRevenue,

                    paymentReport: paymentResults,

                    attendanceReport: attendanceResults

                });

            });

        });

    });

});


// Get all booking requests - Admin only
app.get("/api/bookings", requireLogin, (req, res) => {

    const sql = `
        SELECT
            booking_requests.id,
            booking_requests.name,
            booking_requests.phone,
            booking_requests.booking_date,
            booking_requests.status,
            packages.package_name
        FROM booking_requests
        JOIN packages
            ON booking_requests.package_id = packages.id
        ORDER BY booking_requests.id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.log("Get bookings error:", err);

            return res.status(500).json({
                message: "Failed to get booking requests"
            });
        }

        res.json(results);
    });
});

// Get all booking requests - Admin only
app.get("/api/bookings", requireLogin, (req, res) => {

    const sql = `
        SELECT
            booking_requests.id,
            booking_requests.name,
            booking_requests.phone,
            booking_requests.booking_date,
            booking_requests.status,
            packages.package_name
        FROM booking_requests
        JOIN packages
            ON booking_requests.package_id = packages.id
        ORDER BY booking_requests.id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.log("Get bookings error:", err);

            return res.status(500).json({
                message: "Failed to get booking requests"
            });
        }

        res.json(results);
    });
});

// Update booking status - Admin only
app.put("/api/bookings/:id/status", requireLogin, (req, res) => {

    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["Approved", "Rejected"].includes(status)) {
        return res.status(400).json({
            message: "Invalid booking status"
        });
    }

    const sql = `
        UPDATE booking_requests
        SET status = ?
        WHERE id = ?
    `;

    db.query(sql, [status, id], (err, result) => {

        if (err) {
            console.log("Update booking status error:", err);

            return res.status(500).json({
                message: "Failed to update booking status"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Booking request not found"
            });
        }

        res.json({
            message: `Booking ${status} successfully`
        });
    });
});

// Home route
app.get("/", (req, res) => {
    res.send("Gym Management System is working!");
});

// Start server
app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});