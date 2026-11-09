// z-index manager for floating dragged items on top
let highestZ = 10;

// svg dynamic curved arrows updater
function getCenter(element) {
    const rect = element.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        radius: Math.min(rect.width, rect.height) / 2
    };
}

function updatePath(pathId, fromEl, toEl, curveOffset = 25) {
    const path = document.getElementById(pathId);
    if (!path || !fromEl || !toEl) return;

    const from = getCenter(fromEl);
    const to = getCenter(toEl);

    const deltaX = to.x - from.x;
    const deltaY = to.y - from.y;
    const distance = Math.hypot(deltaX, deltaY);

    if (distance === 0) return;

    // shorten endpoint so the arrowhead touches the target boundary
    const targetOffset = to.radius + 8;
    const endX = to.x - (deltaX / distance) * targetOffset;
    const endY = to.y - (deltaY / distance) * targetOffset;

    // calculate midpoint with a gentle perpendicular curvature
    const midX = (from.x + endX) / 2;
    const midY = (from.y + endY) / 2;
    const perpX = -deltaY / distance;
    const perpY = deltaX / distance;

    const controlX = midX + perpX * curveOffset;
    const controlY = midY + perpY * curveOffset;

    path.setAttribute(
        "d",
        `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${endX} ${endY}`
    );
}

function updateAllArrows() {
    const noteProjects = document.getElementById("note-projects");
    const projectW = document.getElementById("item-project-w");
    const projectA = document.getElementById("item-project-a");

    const noteFace = document.getElementById("note-face");
    const portrait = document.getElementById("item-portrait");

    updatePath("arrow-to-w", noteProjects, projectW, -20);
    updatePath("arrow-to-a", noteProjects, projectA, 20);
    updatePath("arrow-to-theo", noteFace, portrait, 25);
}

// universal pointer drag handler supporting mouse, touch, and stylus
function makeDraggable(element) {
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;
    let hasMoved = false;

    // prevent native browser image and link ghost dragging
    element.addEventListener("dragstart", (event) => {
        event.preventDefault();
    });

    element.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) return;

        hasMoved = false;
        highestZ++;
        element.style.zIndex = highestZ;

        const rect = element.getBoundingClientRect();
        startX = event.clientX;
        startY = event.clientY;
        initialLeft = rect.left;
        initialTop = rect.top;

        element.setPointerCapture(event.pointerId);
        element.classList.add("dragging");

        const onPointerMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;

            if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
                hasMoved = true;
            }

            element.style.left = `${initialLeft + deltaX}px`;
            element.style.top = `${initialTop + deltaY}px`;
            element.style.right = "auto";
            element.style.bottom = "auto";
            element.style.transform = "none";

            // update dynamic annotation arrows continuously during drag
            updateAllArrows();
        };

        const onPointerUp = () => {
            element.classList.remove("dragging");
            element.removeEventListener("pointermove", onPointerMove);
            element.removeEventListener("pointerup", onPointerUp);
            element.removeEventListener("pointercancel", onPointerUp);

            // if dragged, prevent triggering anchor link navigation
            if (hasMoved) {
                const preventClick = (clickEvent) => {
                    clickEvent.preventDefault();
                    clickEvent.stopPropagation();
                };
                element.addEventListener("click", preventClick, { capture: true, once: true });
            }
        };

        element.addEventListener("pointermove", onPointerMove);
        element.addEventListener("pointerup", onPointerUp);
        element.addEventListener("pointercancel", onPointerUp);
    });
}

// initialize dragging on all canvas elements
const draggableItems = document.querySelectorAll(".canvas-item");
draggableItems.forEach((item) => makeDraggable(item));

// initial arrow calculation and window resize handler
window.addEventListener("load", updateAllArrows);
window.addEventListener("resize", updateAllArrows);
requestAnimationFrame(updateAllArrows);

// theme inversion logic via logo hover on desktop and tap on mobile
const logoItem = document.getElementById("item-logo");
let isDarkToggled = false;
const hasPointer = window.matchMedia("(hover: hover)").matches;

if (logoItem) {
    if (hasPointer) {
        logoItem.addEventListener("mouseenter", () => {
            if (!isDarkToggled) {
                document.body.classList.add("dark-theme");
            }
        });

        logoItem.addEventListener("mouseleave", () => {
            if (!isDarkToggled) {
                document.body.classList.remove("dark-theme");
            }
        });
    }

    logoItem.addEventListener("click", () => {
        isDarkToggled = !isDarkToggled;
        document.body.classList.toggle("dark-theme", isDarkToggled);
    });

    logoItem.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            isDarkToggled = !isDarkToggled;
            document.body.classList.toggle("dark-theme", isDarkToggled);
        }
    });
}
