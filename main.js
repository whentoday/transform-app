const { app, BrowserWindow, ipcMain } = require("electron");
const usb = require("usb");
const path = require("path");

let mainWindow;

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(app.getAppPath(), "preload.js"),
    },
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Obtenha a lista de dispositivos USB e envie para a janela HTML
  const devices = usb.getDeviceList().map((device) => ({
    vendorId: device.deviceDescriptor.idVendor,
    productId: device.deviceDescriptor.idProduct,
  }));

  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.send("usb-devices", devices);
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on("selected-device", (event, selectedDevice) => {
  // Você pode lidar com o dispositivo selecionado aqui
  console.log("Dispositivo USB selecionado:", selectedDevice);

  const devices = usb.getDeviceList();

  // Substitua esses valores pelos IDs do fabricante e do produto do seu dispositivo
  const vendorId = selectedDevice.vendorId;
  const productId = selectedDevice.productId;

  // Procurar o dispositivo desejado na lista
  const device = devices.find(
    (device) =>
      device.deviceDescriptor.idVendor === vendorId &&
      device.deviceDescriptor.idProduct === productId
  );

  if (device) {
    device.open();

    // Configurar a interface (interface e endpoint podem variar de acordo com o dispositivo)
    const iface = device.interfaces[0];
    iface.claim();

    const endpoint = iface.endpoints[0];

    // Ao receber dados do dispositivo
    endpoint.on("data", (data) => {
      // Manipule os dados recebidos aqui
      console.log("Dados recebidos:", data);
    });
  } else {
    console.error("Dispositivo USB não encontrado.");
  }
});
