// dynamic z-index counter starting above the top text display
let highestZ = 100;

// default landing intro text and item descriptions
const defaultText = `i am a developer focused on things you can see, touch, and feel. graduated in computer systems technology from saskatchewan polytechnic, i build purely from imagination and originality under the names theo and marc. i love c for its purity and css for its craft, with no interest in backend logic, corporate buzzwords, or LeetCode problems. i am not a designer or a founder; i simply make software in the exact way i want it to look. through oo1 studio, i match digital interfaces to physical hardware—like shaping a browser view to the exact corner radius of a phone—making tools look beautiful, even if nobody cares.`;

const itemDescriptions = {
    "item-logo": "tom is my mascot and visual counterpart, representing the creative identity across oo1 studio.",
    "item-project-w": "keyboard is an experimental web input project matching tactile mechanical keys to digital screens.",
    "item-project-a": "browser is a custom webview interface shaped to align with physical phone corner radii.",
    "item-portrait": "a raw webcam portrait of theo, captured directly from the computer screen with zero filters.",
    "note-projects": "individual tools and software systems built under oo1 studio.",
    "note-face": "the developer behind the alias marcinlowercase."
};

const displayText = document.getElementById("display-text");

function setDisplayText(text) {
    if (!displayText) return;
    displayText.textContent = text;
}

// bind hover and click descriptions
Object.keys(itemDescriptions).forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener("mouseenter", () => {
        setDisplayText(itemDescriptions[id]);
    });

    el.addEventListener("mouseleave", () => {
        setDisplayText(defaultText);
    });

    el.addEventListener("click", () => {
        setDisplayText(itemDescriptions[id]);
    });
});

// calculate perimeter boundary intersection so arrows start and end outside elements
function getBoundaryPoint(rect, targetX, targetY, padding = 4) {
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = targetX - centerX;
    const deltaY = targetY - centerY;

    if (deltaX === 0 && deltaY === 0) {
        return { x: centerX, y: centerY };
    }

    const halfWidth = rect.width / 2 + padding;
    const halfHeight = rect.height / 2 + padding;

    const scaleX = Math.abs(halfWidth / deltaX);
    const scaleY = Math.abs(halfHeight / deltaY);
    const scale = Math.min(scaleX, scaleY);

    return {
        x: centerX + deltaX * scale,
        y: centerY + deltaY * scale
    };
}

// svg dynamic curved arrows updater
function updatePath(pathId, fromEl, toEl, curveOffset = 25) {
    const path = document.getElementById(pathId);
    if (!path || !fromEl || !toEl) return;

    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();

    const fromCenter = {
        x: fromRect.left + fromRect.width / 2,
        y: fromRect.top + fromRect.height / 2
    };

    const toCenter = {
        x: toRect.left + toRect.width / 2,
        y: toRect.top + toRect.height / 2
    };

    const deltaX = toCenter.x - fromCenter.x;
    const deltaY = toCenter.y - fromCenter.y;
    const distance = Math.hypot(deltaX, deltaY);

    if (distance === 0) return;

    const perpX = -deltaY / distance;
    const perpY = deltaX / distance;
    const midX = (fromCenter.x + toCenter.x) / 2;
    const midY = (fromCenter.y + toCenter.y) / 2;
    const controlX = midX + perpX * curveOffset;
    const controlY = midY + perpY * curveOffset;

    const start = getBoundaryPoint(fromRect, controlX, controlY, 3);
    const end = getBoundaryPoint(toRect, controlX, controlY, 7);

    path.setAttribute(
        "d",
        `M ${start.x} ${start.y} Q ${controlX} ${controlY} ${end.x} ${end.y}`
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

// continuous arrow tracking during spring release animation
function animateArrowFollow() {
    const startTime = performance.now();
    const duration = 340;

    function step(now) {
        updateAllArrows();
        if (now - startTime < duration) {
            requestAnimationFrame(step);
        } else {
            updateAllArrows();
        }
    }
    requestAnimationFrame(step);
}

// universal pointer drag handler bringing active items to top z-index
function makeDraggable(element) {
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;
    let hasMoved = false;

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

            updateAllArrows();
        };

        const onPointerUp = () => {
            element.classList.remove("dragging");
            element.removeEventListener("pointermove", onPointerMove);
            element.removeEventListener("pointerup", onPointerUp);
            element.removeEventListener("pointercancel", onPointerUp);

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

// initialize draggable items
const draggableItems = document.querySelectorAll(".canvas-item");
draggableItems.forEach((item) => makeDraggable(item));

// pull-up peeking portrait behavior with auto-reset on release
const peekingPortrait = document.getElementById("item-portrait");

if (peekingPortrait) {
    let startY = 0;
    let initialOffsetY = 0;

    peekingPortrait.addEventListener("dragstart", (event) => {
        event.preventDefault();
    });

    peekingPortrait.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) return;

        highestZ++;
        peekingPortrait.style.zIndex = highestZ;

        const rect = peekingPortrait.getBoundingClientRect();
        const fullHeight = rect.height;
        const restingOffsetY = fullHeight * 0.8;

        startY = event.clientY;

        const computedTransform = window.getComputedStyle(peekingPortrait).transform;
        if (computedTransform !== "none") {
            const matrixValues = computedTransform.split("(")[1].split(")")[0].split(",");
            initialOffsetY = parseFloat(matrixValues[5]) || restingOffsetY;
        } else {
            initialOffsetY = restingOffsetY;
        }

        peekingPortrait.classList.add("dragging");
        peekingPortrait.setPointerCapture(event.pointerId);

        const onPortraitMove = (moveEvent) => {
            const deltaY = moveEvent.clientY - startY;
            let nextY = initialOffsetY + deltaY;

            if (nextY < 0) nextY = 0;
            if (nextY > restingOffsetY) nextY = restingOffsetY;

            peekingPortrait.style.transform = `translateY(${nextY}px)`;
            updateAllArrows();
        };

        const onPortraitUp = () => {
            peekingPortrait.classList.remove("dragging");
            peekingPortrait.removeEventListener("pointermove", onPortraitMove);
            peekingPortrait.removeEventListener("pointerup", onPortraitUp);
            peekingPortrait.removeEventListener("pointercancel", onPortraitUp);

            peekingPortrait.style.transform = "";
            animateArrowFollow();
        };

        peekingPortrait.addEventListener("pointermove", onPortraitMove);
        peekingPortrait.addEventListener("pointerup", onPortraitUp);
        peekingPortrait.addEventListener("pointercancel", onPortraitUp);
    });
}

// initial arrows calculation and window resize handler
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
