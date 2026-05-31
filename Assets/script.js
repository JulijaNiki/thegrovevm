// ============================================================================
// 1. GLOBAL SCOPE & STATE MANAGEMENT (Called directly via HTML inline actions)
// ============================================================================

let rfbClient = null; // Holds the active noVNC client instance object

/**
 * Changes the active VM screen aspect ratio and updates its background fallback graphic.
 * @param {string} ratioClass - The aspect ratio target class ('ratio-4-3', 'ratio-3-2', 'ratio-16-9')
 * @param {string} imageFileName - Target asset image filename for the background display
 */
function changeRatio(ratioClass, imageFileName) {
    const vmScreen = document.getElementById("groveVmScreen");
    if (vmScreen) {
        vmScreen.classList.remove('ratio-4-3', 'ratio-3-2', 'ratio-16-9');
        vmScreen.classList.add(ratioClass);
        
        if (!rfbClient) {
            vmScreen.style.backgroundImage = `url('Assets/${imageFileName}')`;
        }
    }
}

/**
 * Handles action execution dispatches from the VM terminal control bar interface.
 * @param {string} commandType - Command code ('screenshot', 'cad', 'restart', 'shutdown')
 */
function vmAction(commandType) {
    switch(commandType) {
        case 'screenshot':
            const canvasElement = document.querySelector("#qemuDisplayTarget canvas");
            const vmScreen = document.getElementById("groveVmScreen");
            const cleanTitle = document.title.replace(" - The Grove VM", "").trim();

            if (canvasElement) {
                try {
                    const imageStream = canvasElement.toDataURL("image/png");
                    const downloadLink = document.createElement('a');
                    downloadLink.download = `${cleanTitle || 'VM'}_LiveCapture.png`;
                    downloadLink.href = imageStream;
                    downloadLink.click();
                } catch (e) {
                    alert("Unable to capture canvas due to security constraints.");
                }
            } else if (vmScreen) {
                const computedStyle = window.getComputedStyle(vmScreen);
                const bgImageValue = computedStyle.backgroundImage;
                if (!bgImageValue || bgImageValue === 'none') return;
                
                const cleanUrl = bgImageValue.replace(/url\(['"]?(.*?)['"]?\)/, '$1');
                
                let targetWidth = 1024;
                let targetHeight = 768;
                if (vmScreen.classList.contains('ratio-3-2')) targetWidth = 1152;
                else if (vmScreen.classList.contains('ratio-16-9')) targetWidth = 1366;

                const dummyCanvas = document.createElement('canvas');
                dummyCanvas.width = targetWidth;
                dummyCanvas.height = targetHeight;
                
                const ctx = dummyCanvas.getContext('2d');
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = function() {
                    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
                    const link = document.createElement('a');
                    link.download = `${cleanTitle || 'VM'}_OfflineSnapshot_${targetWidth}x${targetHeight}.png`;
                    link.href = dummyCanvas.toDataURL("image/png");
                    link.click();
                };
                img.src = cleanUrl;
            }
            break;

        case 'cad':
            alert("Instruction sequence simulated: [Ctrl + Alt + Delete]");
            break;

        case 'restart':
            if (confirm("Are you sure you want to trigger a hard system reset layout?")) {
                const activeVmId = document.body.getAttribute("data-active-vm-id");
                const activeWsPort = document.body.getAttribute("data-active-vm-port");
                if (activeVmId && activeWsPort) {
                    generateAndDisplayQemuCommand(activeVmId, activeWsPort);
                }
            }
            break;

        case 'shutdown':
            if (confirm("Close active lab shell console environment?")) {
                document.querySelector(".vm-workspace").style.display = "none";
                document.getElementById("vmGridContainer").style.display = "flex";
                document.title = "The Grove VM";
                document.body.removeAttribute("data-active-vm-id");
                document.body.removeAttribute("data-active-vm-port");
            }
            break;
    }
}

/**
 * Dynamically computes and displays the auto-generated QEMU launcher script execution line.
 * @param {string} vmId - The unique system identifier tag (e.g., win7, win10)
 * @param {string|number} wsPort - Target websocket port parsed from the dynamic HTML matrix
 */



/**
 * Forces the UI display container to clear out the Demo Archive label
 * and connect directly to the local host VNC socket loopback.
 * @param {number} wsPort - The active websockify port (e.g., 6081)
 */
function connectToLocalLoopback(wsPort = 6081) {
    const targetDiv = document.getElementById("qemuDisplayTarget");
    if (!targetDiv) return;

    // 1. Wipe the "DEMO ARCHIVE MODE" text
    targetDiv.innerHTML = ""; 

    // 2. Define the path (ensure it matches your websockify port)
    const hostAddress = window.location.hostname || "127.0.0.1";
    const wsUrl = `ws://${hostAddress}:${wsPort}/`;

    // 3. Connect noVNC
    try {
        rfbClient = new window.RFB(targetDiv, wsUrl);
        rfbClient.scaleViewport = true;
        rfbClient.resizeSession = false;
        console.log("noVNC client initialized successfully.");
    } catch (e) {
        console.error("Failed to initialize noVNC:", e);
        targetDiv.innerHTML = `<div style="color: red;">Error: ${e.message}</div>`;
    }
}
/**
 * Dynamically computes and displays the auto-generated QEMU launcher script execution line.
 * Optimized for Windows Host (WHPX) with CPU Pass-through and VirtIO.
 */
function generateAndDisplayQemuCommand(vmId, wsPort) {
    const targetDiv = document.getElementById("qemuDisplayTarget");
    if (!targetDiv) return;
const terminalDiv = document.getElementById("qemuTerminalDisplay");
    const parsedWsPort = parseInt(wsPort, 10);
    const calculatedVncIndex = parsedWsPort - 6080; 
    const targetVncPort = 5900 + calculatedVncIndex;
const cpuModel = "IvyBridge"; // Example: Options include Haswell, Skylake-Client, Broadwell
    let autoCommand = "";

    if (vmId === "winxp" || vmId === "xp") {
        // --- PRECISION WINDOWS XP LEGACY ARCHITECTURE ---
        const diskPath = `D:\\The Grove VM\\Windows XP\\my_disk.qcow2`;
        autoCommand = `qemu-system-x86_64 -drive file="${diskPath}",format=qcow2 -m 4G -cpu core2duo -M pc-i440fx-4.2  -net nic,model=rtl8139 -net user -vnc 127.0.0.1:${calculatedVncIndex} && websockify ${parsedWsPort} localhost:${targetVncPort}`;
    } else {
        // --- MODERN WINDOWS OS ARCHITECTURE (7, 10, 11) ---
        let osFolderName = "Windows 7";
        if (vmId === "win10") osFolderName = "Windows 10";
        if (vmId === "win11") osFolderName = "Windows 11";

        const diskPath = `D:\\The Grove VM\\${osFolderName}\\my_disk.qcow2`;
        
        // Optimized flags for WHPX acceleration and VirtIO performance
      // Change the separator from && (sequence) to & (parallel) or explain the split
autoCommand = `START /B qemu-system-x86_64 -m 4G -accel whpx -cpu ${cpuModel},hv_relaxed,hv_spinlocks=0x1fff,hv_vapic,hv_time -smp cores=4,threads=1 -hda "${diskPath}" -vga virtio -net nic,model=virtio-net-pci -net user -vnc :${calculatedVncIndex} && START /B websockify ${parsedWsPort} localhost:${targetVncPort}`;    

}

terminalDiv.innerHTML = `
        <div class="terminal-shell" style="...">
            <p># Run this command on your host:</p>
            <div class="cmd-box">${autoCommand}</div>
        </div>
    `;
}

// ============================================================================
// 2. INITIALIZATION & LOCAL DOM EVENT LISTENERS
// ============================================================================
document.addEventListener("DOMContentLoaded", function() {
    
    const modal = document.getElementById("rulesModal");
    const button = document.getElementById("understandBtn");
    const loginModal = document.getElementById("LoginModal");
    const openLoginBtn = document.getElementById("openLoginBtn");
    const closeLoginBtn = document.getElementById("closeLoginBtn");

    const vmGridContainer = document.getElementById("vmGridContainer");
    const vmCards = document.querySelectorAll(".card[data-cvm-node]");
    const vmWorkspace = document.querySelector(".vm-workspace");
    const fallbackTarget = document.getElementById("qemuDisplayTarget");

    if (vmWorkspace) vmWorkspace.style.display = "none";
    const hasAcceptedRules = localStorage.getItem("groveRulesAccepted");

    // Rules Modal Logic
    if (modal && button && !hasAcceptedRules) {
        modal.style.display = "flex"; 
        let timeLeft = 3;
        const countdown = setInterval(function() {
            timeLeft--;
            if (timeLeft > 0) { button.textContent = `I Understood (${timeLeft}s)`; } 
            else { clearInterval(countdown); button.textContent = "I Understood"; button.disabled = false; }
        }, 1000);
        button.addEventListener("click", function() {
            modal.style.display = "none";
            localStorage.setItem("groveRulesAccepted", "true");
        });
    }

    // Login Modals Logic
    if (openLoginBtn) {
        openLoginBtn.addEventListener("click", function() {
            if (!localStorage.getItem("groveRulesAccepted")) { alert("Please read and accept the community rules first!"); return; }
            if (loginModal) loginModal.style.display = "flex";
        });
    }
    if (closeLoginBtn && loginModal) { closeLoginBtn.addEventListener("click", function() { loginModal.style.display = "none"; }); }
    if (loginModal) { loginModal.addEventListener("click", function(e) { if (e.target === loginModal) loginModal.style.display = "none"; }); }

    // Dynamic Card Selector Interceptor Matrix
    if (vmGridContainer && vmCards.length > 0) {
        vmCards.forEach(function(card) {
            card.addEventListener("click", function() {
                const vmId = card.getAttribute("data-cvm-node");
                const wsPort = card.getAttribute("data-ws-port");

                if (card.getAttribute("data-cvm-status") === "disabled" || card.classList.contains("disabled-card")) {
                    alert("This virtual machine environment has been disabled by the administrator.");
                    return; 
                }

                const osTitleElement = card.querySelector(".card-body h5");
                if (osTitleElement) {
                    const osName = osTitleElement.textContent.trim();
                    document.title = `${osName} - The Grove VM`;
                }

                vmGridContainer.style.display = "none";
                if (vmWorkspace) vmWorkspace.style.display = "flex";

                if (vmId && wsPort) {
                    // Set active session context tracking parameters on body scope tags
                    document.body.setAttribute("data-active-vm-id", vmId);
                    document.body.setAttribute("data-active-vm-port", wsPort);

                    // Clear any monitor background frame images to prevent structural overlapping lines
                    const vmScreen = document.getElementById("groveVmScreen");
                    if (vmScreen) vmScreen.style.backgroundImage = "none";

                    // Fire the automatic command generation screen instantly inside your workspace frame bounds
                    generateAndDisplayQemuCommand(vmId, wsPort);
                } else {
                    if (fallbackTarget) {
                        fallbackTarget.innerHTML = `<div class="terminal-shell" ...>
        ...
        <div class="cmd-box">${autoCommand}</div>
        <button onclick="connectToLocalLoopback(${wsPort})" 
                style="margin-top:15px; padding: 10px; cursor:pointer; background: #00ff00; border:none;">
            CONNECT TO VM
        </button>
    </div>`;
                    } 
                }
            });
        });
    }
});