export const products = [
  // Microcontrollers & Development Boards
  {
    id: 1,
    name: "Arduino Uno + USB Cable",
    price: "K650",
    category: "Microcontrollers",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/arduino-uno-r3-1748603951988-impc78.jpg",
    description: "Complete Arduino Uno R3 development board with USB cable for programming and power",
    inStock: true,
    badge: "Best Seller",
    featured: true
  },
  {
    id: 2,
    name: "Arduino Mega (Atmega2560 + USB Cable)",
    price: "K1000",
    category: "Microcontrollers",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/arduino-mega-2560-1748603960736-c7v4ia.jpg",
    description: "High-performance Arduino Mega with 54 digital pins and extended memory",
    inStock: true,
    badge: "Professional",
    featured: true
  },
  {
    id: 3,
    name: "Arduino Nano",
    price: "K450",
    category: "Microcontrollers",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/arduino-nano-1748603956926-vinm1g.jpg",
    description: "Compact Arduino Nano development board perfect for small projects",
    inStock: true
  },
  {
    id: 4,
    name: "Arduino Nano Terminal Adapter",
    price: "K250",
    category: "Microcontrollers",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/breadboard-1748603978848-arhihy.jpg",
    description: "Terminal adapter for Arduino Nano",
    inStock: true
  },
  {
    id: 5,
    name: "Atmega 328P Microcontroller Set",
    price: "K350",
    category: "Microcontrollers",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/resistor-kit-1748603980786-a0mb17.jpg",
    description: "Atmega 328P microcontroller with accessories",
    inStock: true
  },

  // WiFi Modules
  {
    id: 6,
    name: "ESP8266 NodeMCU WiFi Module",
    price: "K800",
    category: "WiFi Modules",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/esp32-development-board-1748603955352-1tqsnv.jpg",
    description: "Popular ESP8266 WiFi development board for IoT projects",
    inStock: true,
    badge: "WiFi Ready",
    featured: true
  },
  {
    id: 7,
    name: "ESP NodeMCU WRover WiFi Module",
    price: "K800",
    category: "WiFi Modules",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/lcd-display-16x2-1748603977922-rmw7we.jpg",
    description: "ESP32 WRover module with extended memory",
    inStock: true
  },
  {
    id: 8,
    name: "ESP32 WiFi module with OV2640 Cam Version",
    price: "K800",
    category: "WiFi Modules",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/led-kit-1748603982201-zjecry.jpg",
    description: "ESP32 development board with integrated camera module",
    inStock: true,
    badge: "Camera"
  },

  // Sensors
  {
    id: 9,
    name: "HC-SR04 Ultrasonic Sensor",
    price: "K250",
    category: "Sensors",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/ultrasonic-sensor-hc-sr04-1748603963344-8gl2xh.jpg",
    description: "Ultrasonic distance sensor for Arduino projects with 2-400cm range",
    inStock: true,
    badge: "Distance",
    featured: true
  },
  {
    id: 10,
    name: "DHT11 Temperature & Humidity Sensor",
    price: "K250",
    category: "Sensors",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/dht22-temperature-sensor-1748603965753-gpgedw.jpg",
    description: "Digital temperature and humidity sensor for environmental monitoring",
    inStock: true,
    badge: "Climate"
  },
  {
    id: 11,
    name: "HC-SR501 PIR Motion Sensor",
    price: "K250",
    category: "Sensors",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/pir-motion-sensor-1748603969560-v36eni.jpg",
    description: "Passive infrared motion detection sensor",
    inStock: true,
    badge: "Motion"
  },
  {
    id: 12,
    name: "PIR Motion Sensor (HC-SR501)",
    price: "K250",
    category: "Sensors",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/pir-motion-sensor-1748603969560-v36eni.jpg",
    description: "Passive infrared motion detection sensor for security applications",
    inStock: true
  },
  {
    id: 13,
    name: "PIR Obstacle Avoidance Sensor",
    price: "K250",
    category: "Sensors",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/breadboard-1748603978848-arhihy.jpg",
    description: "Infrared obstacle detection sensor for robotics",
    inStock: true
  },
  {
    id: 14,
    name: "LM35 Temperature Sensor",
    price: "K250",
    category: "Sensors",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/dht22-temperature-sensor-1748603965753-gpgedw.jpg",
    description: "Analog temperature sensor with linear output",
    inStock: true
  },
  {
    id: 15,
    name: "MQ-2 Smoke & LPG Gas Sensor",
    price: "K250",
    category: "Sensors",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/resistor-kit-1748603980786-a0mb17.jpg",
    description: "Gas sensor for smoke and LPG detection",
    inStock: true
  },
  {
    id: 16,
    name: "MQ-3 Gas Sensor",
    price: "K250",
    category: "Sensors",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/led-kit-1748603982201-zjecry.jpg",
    description: "Alcohol gas sensor for breath analyzer projects",
    inStock: true
  },
  {
    id: 17,
    name: "ACS712 Current Sensor",
    price: "K250",
    category: "Sensors",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/jumper-wires-1748603979870-jvdzb2.jpg",
    description: "Hall effect current sensor for AC/DC current measurement",
    inStock: true
  },
  {
    id: 18,
    name: "AS608n Fingerprint Sensor",
    price: "K800",
    category: "Sensors",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/pir-motion-sensor-1748603969560-v36eni.jpg",
    description: "Optical fingerprint recognition sensor for security applications",
    inStock: true,
    badge: "Security"
  },
  {
    id: 19,
    name: "Heart Rate Sensor (KY-039)",
    price: "K350",
    category: "Sensors",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/lcd-display-16x2-1748603977922-rmw7we.jpg",
    description: "Heart rate monitoring sensor for health applications",
    inStock: true
  },
  {
    id: 20,
    name: "Capacitive Touch Sensor",
    price: "K200",
    category: "Sensors",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/arduino-nano-1748603956926-vinm1g.jpg",
    description: "Touch-sensitive capacitive sensor for user interfaces",
    inStock: true
  },
  {
    id: 21,
    name: "20kg Load Cell Weight Sensor + HX711 AD Module",
    price: "K450",
    category: "Sensors",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/esp32-development-board-1748603955352-1tqsnv.jpg",
    description: "Load cell with amplifier module for weight measurement up to 20kg",
    inStock: true,
    badge: "Complete Kit"
  },
  {
    id: 22,
    name: "Micro SD Card Module",
    price: "K100",
    category: "Sensors",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/breadboard-1748603978848-arhihy.jpg",
    description: "SD card reader module for data storage projects",
    inStock: true
  },

  // Motor Drivers & Motors
  {
    id: 23,
    name: "L298N Motor Driver",
    price: "K250",
    category: "Motor Drivers",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/resistor-kit-1748603980786-a0mb17.jpg",
    description: "Dual H-bridge motor driver for DC motors and stepper motors",
    inStock: true,
    badge: "Popular"
  },
  {
    id: 24,
    name: "L293D Motor Driver IC",
    price: "K100",
    category: "Motor Drivers",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/led-kit-1748603982201-zjecry.jpg",
    description: "Quad half-H driver IC for motor control",
    inStock: true
  },
  {
    id: 25,
    name: "9g Micro Servo Motor",
    price: "K180",
    category: "Motors",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/jumper-wires-1748603979870-jvdzb2.jpg",
    description: "Small servo motor for precise positioning control",
    inStock: true
  },
  {
    id: 26,
    name: "Nema 17 Stepper Motor",
    price: "K450",
    category: "Motors",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/arduino-uno-r3-1748603951988-impc78.jpg",
    description: "High-precision stepper motor for 3D printers and CNC machines",
    inStock: true,
    badge: "Precision"
  },

  // Relay Modules
  {
    id: 27,
    name: "5V, 10A, Single Channel Relay Module",
    price: "K150",
    category: "Relay Modules",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/arduino-mega-2560-1748603960736-c7v4ia.jpg",
    description: "Single channel relay module for switching high power devices",
    inStock: true
  },
  {
    id: 28,
    name: "5V 2-Channel Relay Module (Jumper Connection)",
    price: "K250",
    category: "Relay Modules",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/arduino-nano-1748603956926-vinm1g.jpg",
    description: "Dual channel relay module with jumper connections",
    inStock: true
  },
  {
    id: 29,
    name: "5V 2-Channel Relay Module (Wire-Screw Connection)",
    price: "K250",
    category: "Relay Modules",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/breadboard-1748603978848-arhihy.jpg",
    description: "Dual channel relay module with screw terminal connections",
    inStock: true
  },
  {
    id: 30,
    name: "5V 4-Channel Relay Module",
    price: "K350",
    category: "Relay Modules",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/esp32-development-board-1748603955352-1tqsnv.jpg",
    description: "Four channel relay module for multiple device control",
    inStock: true,
    badge: "Multi-Channel"
  },

  // Displays
  {
    id: 31,
    name: "16x2 LCD Display (with I2C)",
    price: "K350",
    category: "Displays",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/lcd-display-16x2-1748603977922-rmw7we.jpg",
    description: "16x2 character LCD with I2C interface for easy connection",
    inStock: true,
    badge: "I2C Ready"
  },
  {
    id: 32,
    name: "16x2 LCD Display (without I2C)",
    price: "K300",
    category: "Displays",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/led-kit-1748603982201-zjecry.jpg",
    description: "Standard 16x2 character LCD display",
    inStock: true
  },
  {
    id: 33,
    name: "20x4 Alphanumeric LCD Display (with I2C)",
    price: "K450",
    category: "Displays",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/jumper-wires-1748603979870-jvdzb2.jpg",
    description: "Large 20x4 character LCD with I2C interface",
    inStock: true,
    badge: "Large Display"
  },

  // Components & Accessories
  {
    id: 34,
    name: "170-Point Breadboard",
    price: "K100",
    category: "Components",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/breadboard-1748603978848-arhihy.jpg",
    description: "Small solderless breadboard for prototyping electronic circuits",
    inStock: true,
    badge: "Compact"
  },
  {
    id: 35,
    name: "800-Point PCB Board",
    price: "K350",
    category: "Components",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/resistor-kit-1748603980786-a0mb17.jpg",
    description: "Large prototyping PCB board for permanent circuits",
    inStock: true
  },
  {
    id: 36,
    name: "High-Quality Double-Sided PCB Board",
    price: "K250",
    category: "Components",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/led-kit-1748603982201-zjecry.jpg",
    description: "Professional double-sided PCB for advanced projects",
    inStock: true,
    badge: "Professional"
  },
  {
    id: 37,
    name: "LEDs (per unit)",
    price: "K10",
    category: "Components",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/led-kit-1748603982201-zjecry.jpg",
    description: "Individual LEDs in various colors for projects",
    inStock: true
  },
  {
    id: 38,
    name: "Jumper Wires",
    price: "K4",
    category: "Components",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/jumper-wires-1748603979870-jvdzb2.jpg",
    description: "Individual jumper wires for breadboard connections (per line)",
    inStock: true
  },
  {
    id: 39,
    name: "Potentiometer (1M Trimmer)",
    price: "K50",
    category: "Components",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/arduino-uno-r3-1748603951988-impc78.jpg",
    description: "1M ohm trimmer potentiometer for variable resistance",
    inStock: true
  },

  // ICs & Timers
  {
    id: 40,
    name: "NE555 Timer IC",
    price: "K60",
    category: "ICs",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/arduino-mega-2560-1748603960736-c7v4ia.jpg",
    description: "Popular 555 timer IC for timing and oscillator circuits",
    inStock: true,
    badge: "Classic"
  },
  {
    id: 41,
    name: "7805 & 7812 Voltage Regulator",
    price: "K30",
    category: "ICs",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/arduino-nano-1748603956926-vinm1g.jpg",
    description: "Voltage regulator ICs for 5V and 12V power supplies",
    inStock: true
  },

  // Audio & Communication
  {
    id: 42,
    name: "DFPlayer Mini MP3 Player Module",
    price: "K200",
    category: "Audio",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/esp32-development-board-1748603955352-1tqsnv.jpg",
    description: "Small MP3 player module with SD card support",
    inStock: true,
    badge: "Audio"
  },
  {
    id: 43,
    name: "PAM8403 Audio Amplifier Module",
    price: "K120",
    category: "Audio",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/lcd-display-16x2-1748603977922-rmw7we.jpg",
    description: "Small audio amplifier module for speakers",
    inStock: true
  },

  // Power & Accessories
  {
    id: 44,
    name: "12V DC Pump (Non Submersible)",
    price: "K350",
    category: "Power & Accessories",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/breadboard-1748603978848-arhihy.jpg",
    description: "12V DC water pump for irrigation and water transfer projects",
    inStock: true
  },
  {
    id: 45,
    name: "12V DC Small Electromagnetic Lock",
    price: "K350",
    category: "Power & Accessories",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/resistor-kit-1748603980786-a0mb17.jpg",
    description: "Small electromagnetic lock for security applications",
    inStock: true,
    badge: "Security"
  },
  {
    id: 46,
    name: "9V Battery Clip Holder Case with DC Jack",
    price: "K80",
    category: "Power & Accessories",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/led-kit-1748603982201-zjecry.jpg",
    description: "9V battery holder with DC jack connector",
    inStock: true
  },
  {
    id: 47,
    name: "9V Battery Snap Power Cable with DC Jack",
    price: "K80",
    category: "Power & Accessories",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/jumper-wires-1748603979870-jvdzb2.jpg",
    description: "9V battery snap connector with DC jack",
    inStock: true
  },
  {
    id: 48,
    name: "9V, 1A DC Power Supply",
    price: "K250",
    category: "Power & Accessories",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/arduino-uno-r3-1748603951988-impc78.jpg",
    description: "9V 1A DC power adapter for projects",
    inStock: true
  },
  {
    id: 49,
    name: "3000VA Solar Africa Inverter with Charger",
    price: "K2800",
    category: "Power & Accessories",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/arduino-mega-2560-1748603960736-c7v4ia.jpg",
    description: "High-capacity solar inverter with built-in charger",
    inStock: true,
    badge: "Solar",
    featured: true
  },

  // Starter Kits
  {
    id: 50,
    name: "Arduino Starter Kit (Starter Kit for Arduino UNO R3)",
    price: "K2500",
    category: "Starter Kits",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/arduino-uno-r3-1748603951988-impc78.jpg",
    description: "Complete Arduino starter kit with Uno, breadboard, sensors, LEDs, and components",
    inStock: true,
    badge: "Complete Kit",
    featured: true
  }
];
