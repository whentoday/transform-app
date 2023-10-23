window.ipcRenderer = require("electron").ipcRenderer;
console.log(window.ipcRenderer);

window.onload = function () {
  window.ipcRenderer.on("usb-devices", (event, devices) => {
    const usbDevicesList = document.getElementById("usbDevices");
    devices.forEach((device) => {
      const option = document.createElement("option");
      option.value = JSON.stringify(device);
      option.text = `Vendor ID: 0x${device.vendorId.toString(
        16
      )}, Product ID: 0x${device.productId.toString(16)}`;
      usbDevicesList.appendChild(option);
    });
  });

  document.getElementById("selectDevice").addEventListener("click", () => {
    const selectedOption = document.getElementById("usbDevices").value;
    if (selectedOption) {
      const selectedDevice = JSON.parse(selectedOption);
      window.ipcRenderer.send("selected-device", selectedDevice);
    }
  });
};
