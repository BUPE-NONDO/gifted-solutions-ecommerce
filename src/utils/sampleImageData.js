// Sample image metadata for testing the gallery
export const sampleImageMetadata = {
  'arduino-uno-r3-1748603951988-impc78.jpg': {
    title: 'Arduino Uno R3 Development Board',
    description: 'High-quality Arduino Uno R3 development board perfect for electronics projects and prototyping. Features 14 digital I/O pins, 6 analog inputs, USB connectivity, and a 16MHz crystal oscillator.',
    price: '650',
    featured: true,
    inStock: true,
    tags: ['arduino', 'microcontroller', 'development', 'prototyping'],
    specifications: {
      voltage: '5V',
      digitalPins: 14,
      analogPins: 6,
      flashMemory: '32KB',
      sram: '2KB',
      eeprom: '1KB',
      clockSpeed: '16MHz'
    }
  },
  'esp32-development-board-1748603955352-1tqsnv.jpg': {
    title: 'ESP32 Development Board',
    description: 'Powerful ESP32 wireless development board with built-in WiFi and Bluetooth connectivity. Perfect for IoT applications, smart home projects, and wireless sensor networks.',
    price: '850',
    featured: true,
    inStock: true,
    tags: ['esp32', 'wifi', 'bluetooth', 'iot', 'wireless'],
    specifications: {
      processor: 'Dual-core Tensilica LX6',
      clockSpeed: '240MHz',
      wifi: '802.11 b/g/n',
      bluetooth: 'v4.2 BR/EDR and BLE',
      flash: '4MB',
      sram: '520KB',
      gpio: 34
    }
  },
  'ultrasonic-sensor-hc-sr04-1748603963344-8gl2xh.jpg': {
    title: 'Ultrasonic Distance Sensor HC-SR04',
    description: 'Precision ultrasonic distance sensor for accurate measurements from 2cm to 400cm. Ideal for robotics, automation projects, and obstacle detection systems.',
    price: '120',
    featured: false,
    inStock: true,
    tags: ['sensor', 'ultrasonic', 'distance', 'robotics'],
    specifications: {
      range: '2cm - 400cm',
      accuracy: '3mm',
      voltage: '5V DC',
      current: '15mA',
      frequency: '40Hz',
      triggerPulse: '10µs TTL'
    }
  },
  'breadboard-1748603978848-arhihy.jpg': {
    title: 'Solderless Breadboard 830 Points',
    description: 'High-quality 830-point solderless breadboard for prototyping electronic circuits. Features reliable spring-loaded contacts and clear markings for easy circuit building.',
    price: '45',
    featured: false,
    inStock: true,
    tags: ['breadboard', 'prototyping', 'solderless', 'circuit'],
    specifications: {
      points: 830,
      size: '165mm x 55mm',
      spacing: '2.54mm',
      voltage: '5V max',
      current: '1A max',
      material: 'ABS plastic'
    }
  },
  'led-5mm-red-1748603982123-xyz123.jpg': {
    title: '5mm Red LED (Pack of 10)',
    description: 'Bright 5mm red LEDs perfect for indicators, displays, and decorative lighting. High efficiency and long lifespan make them ideal for any electronics project.',
    price: '25',
    featured: false,
    inStock: true,
    tags: ['led', 'red', 'indicator', 'lighting'],
    specifications: {
      size: '5mm',
      color: 'Red',
      voltage: '2.0-2.2V',
      current: '20mA',
      luminosity: '2000-3000mcd',
      viewingAngle: '30°'
    }
  },
  'resistor-pack-1748603985456-abc456.jpg': {
    title: 'Resistor Assortment Kit (600 pieces)',
    description: 'Complete resistor kit with 600 pieces covering 30 different values from 10Ω to 1MΩ. Includes storage box and color code chart for easy identification.',
    price: '180',
    featured: false,
    inStock: true,
    tags: ['resistor', 'kit', 'assortment', 'components'],
    specifications: {
      pieces: 600,
      values: '30 different',
      range: '10Ω - 1MΩ',
      tolerance: '±5%',
      power: '1/4W',
      package: 'Storage box included'
    }
  },
  'jumper-wires-1748603987789-def789.jpg': {
    title: 'Jumper Wire Set (120 pieces)',
    description: 'Versatile jumper wire set with male-to-male, male-to-female, and female-to-female connections. Essential for breadboard prototyping and Arduino projects.',
    price: '85',
    featured: false,
    inStock: true,
    tags: ['jumper', 'wires', 'connections', 'breadboard'],
    specifications: {
      pieces: 120,
      types: 'M-M, M-F, F-F',
      length: '20cm',
      colors: '10 different',
      gauge: '26AWG',
      voltage: '300V max'
    }
  },
  'servo-motor-sg90-1748603990012-ghi012.jpg': {
    title: 'SG90 Micro Servo Motor',
    description: 'Compact and lightweight servo motor perfect for robotics and RC applications. Provides precise position control with 180° rotation range.',
    price: '95',
    featured: true,
    inStock: false, // Out of stock for testing
    tags: ['servo', 'motor', 'robotics', 'control'],
    specifications: {
      rotation: '180°',
      torque: '1.8kg/cm',
      speed: '0.1s/60°',
      voltage: '4.8-6V',
      weight: '9g',
      dimensions: '22.2×11.8×31mm'
    }
  },
  // Additional sample items
  'lcd-display-16x2-1748603992345-jkl345.jpg': {
    title: '16x2 LCD Display Module',
    description: 'Clear 16x2 character LCD display with blue backlight. Perfect for displaying sensor data, menu systems, and project information.',
    price: '180',
    featured: false,
    inStock: true,
    tags: ['lcd', 'display', 'character', 'blue'],
    specifications: {
      size: '16x2 characters',
      backlight: 'Blue LED',
      voltage: '5V',
      interface: 'Parallel',
      dimensions: '80×36×12mm'
    }
  },
  'temperature-sensor-ds18b20-1748603994567-mno567.jpg': {
    title: 'DS18B20 Digital Temperature Sensor',
    description: 'Waterproof digital temperature sensor with high accuracy. One-wire interface makes it easy to connect multiple sensors.',
    price: '75',
    featured: false,
    inStock: false, // Out of stock
    tags: ['temperature', 'sensor', 'digital', 'waterproof'],
    specifications: {
      range: '-55°C to +125°C',
      accuracy: '±0.5°C',
      interface: 'One-Wire',
      resolution: '9-12 bit',
      cable: '1m waterproof'
    }
  }
};

// Function to apply sample metadata to images
export const applySampleMetadata = (images) => {
  return images.map(image => {
    const metadata = sampleImageMetadata[image.name];
    if (metadata) {
      return {
        ...image,
        ...metadata
      };
    }
    return image;
  });
};

// Function to get sample metadata for a specific image
export const getSampleMetadata = (imageName) => {
  return sampleImageMetadata[imageName] || null;
};
