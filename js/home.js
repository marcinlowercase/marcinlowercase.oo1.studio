// dynamic z-index counter starting above the top text display
let highestZ = 100;

// default landing intro text with link and item descriptions
const defaultText = `i am Theo and marcinlowercase and the developer of <a href="https://oo1.studio" target="_blank" rel="noopener noreferrer">oo1 studio</a>`;

const itemDescriptions = {
    "item-logo": "the mark of marcinlowercase",
    "item-project-w": "built for coding and terminal on mobile",
    "item-project-a": "run web apps on mobile without hosting",
    "item-portrait": "Theo on November 9, 2026"
};

const displayText = document.getElementById("display-text");

function setDisplayText(content) {
    if (!displayText) return;
    displayText.innerHTML = content;
}

// desktop-only hover listeners for descriptions
const hasPointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (hasPointer) {
    Object.keys(itemDescriptions).forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;

        el.addEventListener("mouseenter", () => {
            setDisplayText(itemDescriptions[id]);
        });

        el.addEventListener("mouseleave", () => {
            setDisplayText(defaultText);
        });
    });
}

// check if two rectangular bounding boxes overlap with an optional buffer
function isOverlapping(rect1, rect2, buffer = 8) {
    return !(
        rect1.right + buffer < rect2.left ||
        rect1.left - buffer > rect2.right ||
        rect1.bottom + buffer < rect2.top ||
        rect1.top - buffer > rect2.bottom
    );
}

// calculate perimeter boundary intersection so lines start and end outside elements
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

// svg dynamic straight dotted lines updater
function updatePath(pathId, fromEl, toEl) {
    const path = document.getElementById(pathId);
    if (!path || !fromEl || !toEl) return;

    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();

    if (isOverlapping(fromRect, toRect, 6)) {
        path.setAttribute("d", "");
        return;
    }

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

    if (distance === 0) {
        path.setAttribute("d", "");
        return;
    }

    // calculate boundary points directly on the direct line of sight
    const start = getBoundaryPoint(fromRect, toCenter.x, toCenter.y, 4);
    const end = getBoundaryPoint(toRect, fromCenter.x, fromCenter.y, 4);

    const dotProduct = (end.x - start.x) * deltaX + (end.y - start.y) * deltaY;
    if (dotProduct <= 0) {
        path.setAttribute("d", "");
        return;
    }

    // straight line path
    path.setAttribute(
        "d",
        `M ${start.x} ${start.y} L ${end.x} ${end.y}`
    );
}

// update all active straight dotted connector lines
function updateAllLines() {
    const logo = document.getElementById("item-logo");
    const projectA = document.getElementById("item-project-a");
    const projectW = document.getElementById("item-project-w");
    const noteFace = document.getElementById("note-face");
    const portrait = document.getElementById("item-portrait");

    updatePath("line-tom-to-a", logo, projectA);
    updatePath("line-tom-to-w", logo, projectW);
    updatePath("line-note-to-theo", noteFace, portrait);
}

// continuous line tracking during spring release animation
function animateLineFollow() {
    const startTime = performance.now();
    const duration = 340;

    function step(now) {
        updateAllLines();
        if (now - startTime < duration) {
            requestAnimationFrame(step);
        } else {
            updateAllLines();
        }
    }
    requestAnimationFrame(step);
}

// pointer drag handler with time-based ghost click prevention
const logoItem = document.getElementById("item-logo");
let isDarkToggled = false;

function makeDraggable(element) {
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;
    let hasMoved = false;
    let dragEndTime = 0;

    element.addEventListener("dragstart", (event) => {
        event.preventDefault();
    });

    element.addEventListener("click", (event) => {
        if (Date.now() - dragEndTime < 150) {
            event.preventDefault();
            event.stopPropagation();
        }
    }, { capture: true });

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

        const onPointerMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;

            if (!hasMoved && (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)) {
                hasMoved = true;
                element.classList.add("dragging");

                if (itemDescriptions[element.id]) {
                    setDisplayText(itemDescriptions[element.id]);
                }

                if (element.id === "item-logo") {
                    document.body.classList.add("dark-theme");
                    element.classList.add("is-solid");
                }
            }

            if (hasMoved) {
                element.style.left = `${initialLeft + deltaX}px`;
                element.style.top = `${initialTop + deltaY}px`;
                element.style.right = "auto";
                element.style.bottom = "auto";

                updateAllLines();
            }
        };

        const onPointerUp = (upEvent) => {
            element.removeEventListener("pointermove", onPointerMove);
            element.removeEventListener("pointerup", onPointerUp);
            element.removeEventListener("pointercancel", onPointerUp);

            if (hasMoved) {
                dragEndTime = Date.now();
                element.classList.remove("dragging");

                if (element.id === "item-logo" && !isDarkToggled) {
                    document.body.classList.remove("dark-theme");
                    element.classList.remove("is-solid");
                }

                if (itemDescriptions[element.id]) {
                    if (upEvent.pointerType === "touch" || !element.matches(":hover")) {
                        setDisplayText(defaultText);
                    }
                }
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

// pull-up peeking portrait behavior with auto-reset and line tracking
const peekingPortrait = document.getElementById("item-portrait");

if (peekingPortrait) {
    let startY = 0;
    let initialOffsetY = 0;

    peekingPortrait.addEventListener("dragstart", (event) => {
        event.preventDefault();
    });

    peekingPortrait.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) return;

        setDisplayText(itemDescriptions["item-portrait"]);

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
            updateAllLines();
        };

        const onPortraitUp = (upEvent) => {
            peekingPortrait.classList.remove("dragging");
            peekingPortrait.removeEventListener("pointermove", onPortraitMove);
            peekingPortrait.removeEventListener("pointerup", onPortraitUp);
            peekingPortrait.removeEventListener("pointercancel", onPortraitUp);

            peekingPortrait.style.transform = "";
            animateLineFollow();

            if (upEvent.pointerType === "touch" || !peekingPortrait.matches(":hover")) {
                setDisplayText(defaultText);
            }
        };

        peekingPortrait.addEventListener("pointermove", onPortraitMove);
        peekingPortrait.addEventListener("pointerup", onPortraitUp);
        peekingPortrait.addEventListener("pointercancel", onPortraitUp);
    });
}

// initial calculations and window resize listeners
window.addEventListener("load", updateAllLines);
window.addEventListener("resize", updateAllLines);
requestAnimationFrame(updateAllLines);

// theme and logo solid toggle logic on tap
if (logoItem) {
    if (hasPointer) {
        logoItem.addEventListener("mouseenter", () => {
            if (!isDarkToggled) {
                document.body.classList.add("dark-theme");
                logoItem.classList.add("is-solid");
            }
        });

        logoItem.addEventListener("mouseleave", () => {
            if (!isDarkToggled) {
                document.body.classList.remove("dark-theme");
                logoItem.classList.remove("is-solid");
            }
        });
    }

    logoItem.addEventListener("click", () => {
        isDarkToggled = !isDarkToggled;
        document.body.classList.toggle("dark-theme", isDarkToggled);
        logoItem.classList.toggle("is-solid", isDarkToggled);
    });

    logoItem.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            isDarkToggled = !isDarkToggled;
            document.body.classList.toggle("dark-theme", isDarkToggled);
            logoItem.classList.toggle("is-solid", isDarkToggled);
        }
    });
}
