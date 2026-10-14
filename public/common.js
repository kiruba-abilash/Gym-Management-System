async function logout() {
    try {
        const response = await fetch("/api/logout", {
            method: "POST"
        });

        if (response.ok) {
            window.location.href = "/login.html";
        } else {
            alert("Logout failed");
        }

    } catch (error) {
        console.error("Logout error:", error);
        alert("Server error");
    }
}