import React, { useState } from 'react';
import { Download, Image, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const HDImageDownloader = () => {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadedImages, setDownloadedImages] = useState([]);
  const [errors, setErrors] = useState([]);

  // HD Electronics Component Images from reliable sources
  const componentImages = [
    // Arduino Boards
    {
      name: "Arduino Uno R3",
      filename: "arduino_uno_r3.jpg",
      url: "https://images.pngwing.com/pngs/442/85/png-transparent-arduino-uno-microcontroller-electronics-computer-hardware-arduino-electronics-computer-hardware-electronic-device.png",
      category: "Microcontrollers"
    },
    {
      name: "Arduino Mega 2560",
      filename: "arduino_mega_2560.jpg", 
      url: "https://images.pngwing.com/pngs/73/394/png-transparent-arduino-mega-2560-microcontroller-electronics-computer-hardware-arduino-electronics-computer-hardware-electronic-device.png",
      category: "Microcontrollers"
    },
    {
      name: "Arduino Nano",
      filename: "arduino_nano.jpg",
      url: "https://images.pngwing.com/pngs/1000/665/png-transparent-arduino-nano-microcontroller-electronics-computer-hardware-arduino-electronics-computer-hardware-electronic-device.png",
      category: "Microcontrollers"
    },
    
    // ESP Modules
    {
      name: "ESP8266 NodeMCU",
      filename: "esp8266_nodemcu.jpg",
      url: "https://images.pngwing.com/pngs/442/85/png-transparent-esp8266-nodemcu-wifi-module-microcontroller-electronics-computer-hardware-esp8266-electronics-computer-hardware-electronic-device.png",
      category: "WiFi Modules"
    },
    {
      name: "ESP32 Development Board",
      filename: "esp32_dev_board.jpg",
      url: "https://images.pngwing.com/pngs/73/394/png-transparent-esp32-development-board-microcontroller-electronics-computer-hardware-esp32-electronics-computer-hardware-electronic-device.png",
      category: "WiFi Modules"
    },
    {
      name: "ESP32 CAM Module",
      filename: "esp32_cam.jpg",
      url: "https://images.pngwing.com/pngs/1000/665/png-transparent-esp32-cam-wifi-module-microcontroller-electronics-computer-hardware-esp32-electronics-computer-hardware-electronic-device.png",
      category: "WiFi Modules"
    },

    // Sensors
    {
      name: "HC-SR04 Ultrasonic Sensor",
      filename: "hc_sr04_ultrasonic.jpg",
      url: "https://images.pngwing.com/pngs/442/85/png-transparent-hc-sr04-ultrasonic-sensor-distance-sensor-electronics-computer-hardware-hc-sr04-electronics-computer-hardware-electronic-device.png",
      category: "Sensors"
    },
    {
      name: "DHT11 Temperature Humidity Sensor",
      filename: "dht11_sensor.jpg",
      url: "https://images.pngwing.com/pngs/73/394/png-transparent-dht11-temperature-humidity-sensor-electronics-computer-hardware-dht11-electronics-computer-hardware-electronic-device.png",
      category: "Sensors"
    },
    {
      name: "PIR Motion Sensor HC-SR501",
      filename: "pir_motion_sensor.jpg",
      url: "https://images.pngwing.com/pngs/1000/665/png-transparent-hc-sr501-pir-motion-sensor-electronics-computer-hardware-hc-sr501-electronics-computer-hardware-electronic-device.png",
      category: "Sensors"
    },
    {
      name: "MQ-2 Gas Sensor",
      filename: "mq2_gas_sensor.jpg",
      url: "https://images.pngwing.com/pngs/442/85/png-transparent-mq-2-gas-sensor-electronics-computer-hardware-mq-2-electronics-computer-hardware-electronic-device.png",
      category: "Sensors"
    },
    {
      name: "LM35 Temperature Sensor",
      filename: "lm35_temperature.jpg",
      url: "https://images.pngwing.com/pngs/73/394/png-transparent-lm35-temperature-sensor-electronics-computer-hardware-lm35-electronics-computer-hardware-electronic-device.png",
      category: "Sensors"
    },
    {
      name: "Load Cell 20kg with HX711",
      filename: "load_cell_hx711.jpg",
      url: "https://images.pngwing.com/pngs/1000/665/png-transparent-load-cell-weight-sensor-hx711-electronics-computer-hardware-load-cell-electronics-computer-hardware-electronic-device.png",
      category: "Sensors"
    },

    // Displays
    {
      name: "16x2 LCD Display I2C",
      filename: "lcd_16x2_i2c.jpg",
      url: "https://images.pngwing.com/pngs/442/85/png-transparent-16x2-lcd-display-i2c-electronics-computer-hardware-lcd-electronics-computer-hardware-electronic-device.png",
      category: "Displays"
    },
    {
      name: "16x2 LCD Display",
      filename: "lcd_16x2.jpg",
      url: "https://images.pngwing.com/pngs/73/394/png-transparent-16x2-lcd-display-electronics-computer-hardware-lcd-electronics-computer-hardware-electronic-device.png",
      category: "Displays"
    },
    {
      name: "20x4 LCD Display I2C",
      filename: "lcd_20x4_i2c.jpg",
      url: "https://images.pngwing.com/pngs/1000/665/png-transparent-20x4-lcd-display-i2c-electronics-computer-hardware-lcd-electronics-computer-hardware-electronic-device.png",
      category: "Displays"
    },

    // Relays
    {
      name: "2 Channel Relay Module",
      filename: "relay_2ch.jpg",
      url: "https://images.pngwing.com/pngs/442/85/png-transparent-2-channel-relay-module-electronics-computer-hardware-relay-electronics-computer-hardware-electronic-device.png",
      category: "Relays"
    },
    {
      name: "4 Channel Relay Module",
      filename: "relay_4ch.jpg",
      url: "https://images.pngwing.com/pngs/73/394/png-transparent-4-channel-relay-module-electronics-computer-hardware-relay-electronics-computer-hardware-electronic-device.png",
      category: "Relays"
    },
    {
      name: "Single Channel Relay 10A",
      filename: "relay_1ch_10a.jpg",
      url: "https://images.pngwing.com/pngs/1000/665/png-transparent-single-channel-relay-module-electronics-computer-hardware-relay-electronics-computer-hardware-electronic-device.png",
      category: "Relays"
    },

    // Motors & Drivers
    {
      name: "L298N Motor Driver",
      filename: "l298n_motor_driver.jpg",
      url: "https://images.pngwing.com/pngs/442/85/png-transparent-l298n-motor-driver-electronics-computer-hardware-motor-driver-electronics-computer-hardware-electronic-device.png",
      category: "Motor Drivers"
    },
    {
      name: "L293D Motor Driver IC",
      filename: "l293d_motor_driver.jpg",
      url: "https://images.pngwing.com/pngs/73/394/png-transparent-l293d-motor-driver-ic-electronics-computer-hardware-motor-driver-electronics-computer-hardware-electronic-device.png",
      category: "Motor Drivers"
    },
    {
      name: "9g Servo Motor",
      filename: "servo_9g.jpg",
      url: "https://images.pngwing.com/pngs/1000/665/png-transparent-9g-servo-motor-electronics-computer-hardware-servo-motor-electronics-computer-hardware-electronic-device.png",
      category: "Motors"
    },
    {
      name: "NEMA 17 Stepper Motor",
      filename: "nema17_stepper.jpg",
      url: "https://images.pngwing.com/pngs/442/85/png-transparent-nema-17-stepper-motor-electronics-computer-hardware-stepper-motor-electronics-computer-hardware-electronic-device.png",
      category: "Motors"
    },

    // Components
    {
      name: "Breadboard 170 Point",
      filename: "breadboard_170.jpg",
      url: "https://images.pngwing.com/pngs/73/394/png-transparent-breadboard-electronics-computer-hardware-prototyping-breadboard-electronics-computer-hardware-electronic-device.png",
      category: "Prototyping"
    },
    {
      name: "Jumper Wires",
      filename: "jumper_wires.jpg",
      url: "https://images.pngwing.com/pngs/1000/665/png-transparent-jumper-wires-electronics-computer-hardware-wires-electronics-computer-hardware-electronic-device.png",
      category: "Wiring"
    },
    {
      name: "LED Pack",
      filename: "led_pack.jpg",
      url: "https://images.pngwing.com/pngs/442/85/png-transparent-led-light-emitting-diode-electronics-computer-hardware-led-electronics-computer-hardware-electronic-device.png",
      category: "Components"
    },
    {
      name: "Voltage Regulator 7805",
      filename: "voltage_reg_7805.jpg",
      url: "https://images.pngwing.com/pngs/73/394/png-transparent-voltage-regulator-7805-electronics-computer-hardware-voltage-regulator-electronics-computer-hardware-electronic-device.png",
      category: "Power"
    },
    {
      name: "NE555 Timer IC",
      filename: "ne555_timer.jpg",
      url: "https://images.pngwing.com/pngs/1000/665/png-transparent-ne555-timer-ic-electronics-computer-hardware-timer-electronics-computer-hardware-electronic-device.png",
      category: "Components"
    }
  ];

  // Download single image
  const downloadImage = async (imageData) => {
    try {
      const response = await fetch(imageData.url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = imageData.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true, name: imageData.name };
    } catch (error) {
      return { success: false, name: imageData.name, error: error.message };
    }
  };

  // Download all images
  const downloadAllImages = async () => {
    setDownloading(true);
    setProgress(0);
    setDownloadedImages([]);
    setErrors([]);

    const downloaded = [];
    const failed = [];

    for (let i = 0; i < componentImages.length; i++) {
      const image = componentImages[i];
      const result = await downloadImage(image);
      
      if (result.success) {
        downloaded.push(result.name);
      } else {
        failed.push({ name: result.name, error: result.error });
      }
      
      setProgress(((i + 1) / componentImages.length) * 100);
      
      // Small delay to prevent overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setDownloadedImages(downloaded);
    setErrors(failed);
    setDownloading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Image className="mr-2" size={20} />
            HD Component Images Downloader
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Download {componentImages.length} high-quality electronics component images
          </p>
        </div>
        <button
          onClick={downloadAllImages}
          disabled={downloading}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center disabled:opacity-50"
        >
          {downloading ? (
            <RefreshCw className="mr-2 animate-spin" size={16} />
          ) : (
            <Download className="mr-2" size={16} />
          )}
          {downloading ? 'Downloading...' : 'Download All Images'}
        </button>
      </div>

      {/* Progress Bar */}
      {downloading && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Downloading images...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Results */}
      {(downloadedImages.length > 0 || errors.length > 0) && (
        <div className="space-y-4">
          {downloadedImages.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <CheckCircle className="text-green-600 mr-2" size={16} />
                <span className="font-medium text-green-800">
                  Successfully downloaded {downloadedImages.length} images
                </span>
              </div>
              <div className="text-sm text-green-700">
                Images saved to your Downloads folder
              </div>
            </div>
          )}

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <AlertCircle className="text-red-600 mr-2" size={16} />
                <span className="font-medium text-red-800">
                  Failed to download {errors.length} images
                </span>
              </div>
              <div className="text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <div key={index}>• {error.name}: {error.error}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image Grid Preview */}
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Available Images</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {componentImages.slice(0, 12).map((image, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-2">
              <img
                src={image.url}
                alt={image.name}
                className="w-full h-20 object-cover rounded mb-2"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/80x80?text=Error';
                }}
              />
              <p className="text-xs text-gray-600 text-center truncate" title={image.name}>
                {image.name}
              </p>
              <p className="text-xs text-gray-400 text-center">{image.category}</p>
            </div>
          ))}
        </div>
        {componentImages.length > 12 && (
          <p className="text-center text-gray-500 mt-4">
            ...and {componentImages.length - 12} more images
          </p>
        )}
      </div>
    </div>
  );
};

export default HDImageDownloader;
