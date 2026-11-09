// avatar toggle for touch and click
const avatarToggle = document.getElementById("avatar-toggle");

if (avatarToggle) {
    avatarToggle.addEventListener("click", () => {
        avatarToggle.classList.toggle("active");
    });

    avatarToggle.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            avatarToggle.classList.toggle("active");
        }
    });
}
