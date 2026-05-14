const pool = require('./pool');
const bcrypt = require('bcryptjs');

const seed = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Seed categories
    const categories = [
      { name: 'CNC Machines', slug: 'cnc-machines', description: 'High-precision CNC machining centers and turning centers', icon: 'FaCog', sort_order: 1 },
      { name: 'VMC Machines', slug: 'vmc-machines', description: 'Vertical Machining Centers for precision manufacturing', icon: 'FaCogs', sort_order: 2 },
      { name: 'HMC Machines', slug: 'hmc-machines', description: 'Horizontal Machining Centers for high-volume production', icon: 'FaIndustry', sort_order: 3 },
      { name: 'Special Purpose Machines', slug: 'special-purpose-machines', description: 'Custom designed machines for specific industrial applications', icon: 'FaTools', sort_order: 4 },
      { name: 'Drilling Machines', slug: 'drilling-machines', description: 'Precision drilling and boring machines', icon: 'FaCircle', sort_order: 5 },
      { name: 'Grinding Machines', slug: 'grinding-machines', description: 'Surface and cylindrical grinding solutions', icon: 'FaCompactDisc', sort_order: 6 },
    ];

    for (const cat of categories) {
      await client.query(`
        INSERT INTO categories (name, slug, description, icon, sort_order)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (slug) DO NOTHING
      `, [cat.name, cat.slug, cat.description, cat.icon, cat.sort_order]);
    }

    // Get category IDs
    const catResult = await client.query('SELECT id, slug FROM categories');
    const catMap = {};
    catResult.rows.forEach(r => { catMap[r.slug] = r.id; });

    // Seed products
    const products = [
      {
        category_slug: 'vmc-machines',
        name: 'VMC 850 – Vertical Machining Center',
        slug: 'vmc-850-vertical-machining-center',
        short_description: 'High-speed vertical machining center with BT-40 spindle and 850mm X-axis travel.',
        description: 'The VMC 850 is a high-performance vertical machining center designed for precision component manufacturing. With its rigid Meehanite cast iron structure, high-speed spindle, and advanced control system, it delivers exceptional accuracy and repeatability for complex machining operations.',
        specifications: JSON.stringify({
          'X-Axis Travel': '850 mm',
          'Y-Axis Travel': '500 mm',
          'Z-Axis Travel': '500 mm',
          'Spindle Speed': '8000 RPM',
          'Spindle Taper': 'BT-40',
          'Tool Magazine': '24 Tools ATC',
          'Table Size': '950 x 500 mm',
          'Control System': 'Fanuc 0i-MF',
        }),
        features: ['High rigidity Meehanite cast iron structure', 'Full enclosure with coolant system', 'Auto tool changer (24 tools)', 'Servo driven axes with ball screws', 'Fanuc CNC controller'],
        main_image: '/uploads/machine3.png',
        images: ['/uploads/machine3.png'],
        is_featured: true,
      },
      {
        category_slug: 'vmc-machines',
        name: 'VMC 1050 – Heavy Duty Machining Center',
        slug: 'vmc-1050-heavy-duty-machining-center',
        short_description: 'Heavy duty VMC with 1050mm travel, ideal for large component machining.',
        description: 'The VMC 1050 is engineered for heavy-duty machining of large components. Built with extra-wide guideways and reinforced casting, this machine provides exceptional stability and accuracy even under heavy cutting conditions.',
        specifications: JSON.stringify({
          'X-Axis Travel': '1050 mm',
          'Y-Axis Travel': '600 mm',
          'Z-Axis Travel': '600 mm',
          'Spindle Speed': '6000 RPM',
          'Spindle Taper': 'BT-50',
          'Tool Magazine': '30 Tools ATC',
          'Table Size': '1200 x 600 mm',
          'Control System': 'Siemens 828D',
        }),
        features: ['Extra-wide linear guideways', 'Precision ground ball screws', 'Heavy duty spindle motor', 'Chip conveyor system', 'Central lubrication system'],
        main_image: '/uploads/machine4.png',
        images: ['/uploads/machine4.png'],
        is_featured: true,
      },
      {
        category_slug: 'cnc-machines',
        name: 'CNC Turning Center TC-200',
        slug: 'cnc-turning-center-tc-200',
        short_description: 'Two-axis CNC turning center for high-precision shaft and disc components.',
        description: 'The TC-200 CNC Turning Center offers exceptional precision for shaft, disc, and complex turned parts. Featuring a 2-axis layout with live tooling capability, it is ideal for job shops and production environments.',
        specifications: JSON.stringify({
          'Max. Turning Diameter': '200 mm',
          'Max. Turning Length': '500 mm',
          'Spindle Speed': '4500 RPM',
          'Chuck Size': '8 inch',
          'Tailstock': 'Hydraulic',
          'Control System': 'Fanuc 0i-TF',
          'Tool Turret': '12 Station',
        }),
        features: ['High-speed hydraulic chuck', '12-station servo turret', 'Built-in spindle motor', 'Automatic lubrication', 'Chip conveyor'],
        main_image: '/uploads/machine5.png',
        images: ['/uploads/machine5.png'],
        is_featured: true,
      },
      {
        category_slug: 'cnc-machines',
        name: 'CNC Turning Center TC-350',
        slug: 'cnc-turning-center-tc-350',
        short_description: 'Heavy-duty CNC turning center with 350mm swing for large diameter parts.',
        description: 'Designed for heavy-duty turning operations, the TC-350 handles large diameter workpieces with ease. Its robust construction and powerful spindle make it ideal for heavy material removal.',
        specifications: JSON.stringify({
          'Max. Turning Diameter': '350 mm',
          'Max. Turning Length': '750 mm',
          'Spindle Speed': '3500 RPM',
          'Chuck Size': '12 inch',
          'Tailstock': 'Programmable Hydraulic',
          'Control System': 'Fanuc 0i-TF Plus',
          'Tool Turret': '12 Station VDI',
        }),
        features: ['Heavy duty spindle bearings', 'VDI tool turret', 'Programmable tailstock', 'Oil cooled spindle', 'Full enclosure'],
        main_image: '/uploads/machine6.png',
        images: ['/uploads/machine6.png'],
        is_featured: false,
      },
      {
        category_slug: 'special-purpose-machines',
        name: 'Dispersion Kneader Mixer',
        slug: 'dispersion-kneader-mixer',
        short_description: 'Heavy-duty rubber dispersion kneader for high-volume compound mixing with PLC control.',
        description: 'The SMG Dispersion Kneader Mixer is engineered for intensive rubber and polymer compound mixing. Its twin-rotor design provides superior dispersion with minimal heat generation, ideal for tyre, seal, and gasket manufacturers. Features hydraulic ram pressure control and full PLC automation.',
        specifications: JSON.stringify({
          'Working Capacity': '35 Litres',
          'Fill Factor': '0.65–0.70',
          'Rotor Speed': '20–40 RPM',
          'Ram Pressure': 'Upto 6 kg/cm²',
          'Motor Power': '55 kW',
          'Control System': 'PLC + HMI',
          'Cooling': 'Water-cooled rotors & body',
        }),
        features: ['Twin tangential rotors for intensive mixing', 'Hydraulic ram pressure control', 'PLC + HMI touchscreen automation', 'Water-cooled rotors and chamber body', 'Quick-release drop door for batch discharge', 'Temperature monitoring sensors'],
        main_image: '/uploads/machine1.jpeg',
        images: ['/uploads/machine1.jpeg'],
        is_featured: true,
      },
      {
        category_slug: 'special-purpose-machines',
        name: 'Internal Rubber Mixer – Heavy Duty',
        slug: 'internal-rubber-mixer-heavy-duty',
        short_description: 'Large capacity internal mixer for rubber and polymer compounding in industrial production.',
        description: 'The SMG Heavy-Duty Internal Rubber Mixer delivers consistent, uniform compound quality at scale. Designed for continuous production environments, it features an advanced interlocking rotor geometry and robust Meehanite cast body for long service life.',
        specifications: JSON.stringify({
          'Working Capacity': '75 Litres',
          'Fill Factor': '0.68',
          'Rotor Speed': '15–30 RPM',
          'Ram Pressure': 'Upto 8 kg/cm²',
          'Motor Power': '110 kW',
          'Control System': 'SCADA + PLC',
          'Discharge': 'Hydraulic drop door',
        }),
        features: ['Large-capacity 75L mixing chamber', 'Interlocking rotor geometry', 'SCADA-integrated production monitoring', 'Automatic ingredient dosing ready', 'Heavy-duty Meehanite cast iron body', 'CE certified safety guarding'],
        main_image: '/uploads/machine2.jpeg',
        images: ['/uploads/machine2.jpeg'],
        is_featured: true,
      },
      {
        category_slug: 'grinding-machines',
        name: 'Surface Grinding Machine SG-450',
        slug: 'surface-grinding-machine-sg-450',
        short_description: 'Precision surface grinding machine for flat surface finishing.',
        description: 'The SG-450 delivers superior flatness and surface finish for precision components. With electromagnetic chuck and fine downfeed, it achieves micron-level accuracy.',
        specifications: JSON.stringify({
          'Table Size': '450 x 200 mm',
          'Grinding Wheel': '350 x 40 x 127 mm',
          'Spindle Speed': '2800 RPM',
          'Table Feed': 'Hydraulic',
          'Cross Feed': 'Manual / Auto',
          'Vertical Feed': '0.005 mm per click',
        }),
        features: ['Electromagnetic chuck', 'Fine downfeed mechanism', 'Hydraulic table traverse', 'Wheel balancing stand included', 'Coolant system'],
        main_image: '/uploads/machine7.png',
        images: ['/uploads/machine7.png'],
        is_featured: false,
      },
      {
        category_slug: 'hmc-machines',
        name: 'HMC 500 – Horizontal Machining Center',
        slug: 'hmc-500-horizontal-machining-center',
        short_description: 'High-productivity horizontal machining center with pallet changer.',
        description: 'The HMC 500 is a high-productivity horizontal machining center designed for complex 4-sided machining in a single setup. With dual pallet changer and large tool magazine, it is ideal for mass production.',
        specifications: JSON.stringify({
          'X-Axis Travel': '500 mm',
          'Y-Axis Travel': '500 mm',
          'Z-Axis Travel': '500 mm',
          'Pallet Size': '400 x 400 mm',
          'Spindle Speed': '10000 RPM',
          'Spindle Taper': 'BT-40',
          'Tool Magazine': '60 Tools',
          'Control System': 'Fanuc 31iB',
        }),
        features: ['Dual pallet changer', '4-sided machining in one setup', '60-tool magazine', 'Coolant through spindle', 'Chip conveyor'],
        main_image: '/uploads/machine8.png',
        images: ['/uploads/machine8.png'],
        is_featured: true,
      },
    ];

    for (const prod of products) {
      const catId = catMap[prod.category_slug];
      await client.query(`
        INSERT INTO products (category_id, name, slug, short_description, description, specifications, features, main_image, images, is_featured)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (slug) DO UPDATE SET
          main_image = EXCLUDED.main_image,
          images = EXCLUDED.images
      `, [catId, prod.name, prod.slug, prod.short_description, prod.description, prod.specifications, prod.features, prod.main_image || null, prod.images || [], prod.is_featured]);
    }

    // Seed testimonials
    await client.query('DELETE FROM testimonials');
    const testimonials = [
      { client_name: 'Rajesh Kumar', company: 'AutoParts Industries', designation: 'Production Manager', message: 'SMG Machines has been our trusted partner for over 5 years. Their VMC machines have significantly improved our production capacity and precision. Excellent after-sales support!', rating: 5 },
      { client_name: 'Suresh Patel', company: 'Patel Engineering Works', designation: 'Director', message: 'The CNC turning centers we purchased from SMG have been running 24/7 for 3 years without any major issues. The build quality is outstanding and the team is very professional.', rating: 5 },
      { client_name: 'Anand Sharma', company: 'Precision Components Ltd', designation: 'Technical Head', message: 'We were impressed with their special purpose machine design. They understood our requirement perfectly and delivered a machine that reduced our cycle time by 60%. Highly recommended!', rating: 5 },
      { client_name: 'Mohammed Ismail', company: 'Gulf Industrial Solutions', designation: 'Operations Director', message: 'SMG Machines provided us with excellent quality VMC machines for our facility in Dubai. The installation and training support was world-class.', rating: 4 },
      { client_name: 'Vikram Singh', company: 'Defence Components Mfg', designation: 'General Manager', message: 'For our defence manufacturing requirements, precision and reliability are non-negotiable. SMG Machines delivered on all fronts. The machines have been certified for our quality standards.', rating: 5 },
    ];

    for (const t of testimonials) {
      await client.query(`
        INSERT INTO testimonials (client_name, company, designation, message, rating)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING
      `, [t.client_name, t.company, t.designation, t.message, t.rating]);
    }

    // Seed blogs
    await client.query('DELETE FROM blogs');
    const blogs = [
      {
        title: 'The Evolution of High-Speed CNC Machining',
        slug: 'evolution-of-high-speed-cnc-machining',
        excerpt: 'How modern spindle designs and advanced toolpaths are revolutionizing production lines across the globe.',
        content: '<p>The world of manufacturing has undergone a seismic shift over the last decade. High-speed CNC machining is no longer a luxury but a necessity for modern job shops looking to maintain a competitive edge. This article delves into the core components that make high-speed machining possible, focusing on rigid cast-iron structures, advanced spindle cooling technologies, and adaptive toolpaths that reduce cycle times by up to 40%.</p><p>At SMG Machines, we have consistently pushed the boundaries of what is possible with our VMC series, ensuring that our partners can meet the most demanding tolerances without sacrificing speed.</p>',
        image_url: 'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        author: 'Chief Engineering Officer',
        is_published: true
      },
      {
        title: 'Maintaining Your VMC for Maximum Uptime',
        slug: 'maintaining-your-vmc-maximum-uptime',
        excerpt: 'A comprehensive guide to preventative maintenance for Vertical Machining Centers to ensure decades of precision.',
        content: '<p>A Vertical Machining Center is a significant investment. To protect that investment and ensure it continues to produce parts within micron-level tolerances, a rigorous preventative maintenance schedule is essential.</p><ul><li><strong>Daily:</strong> Check coolant levels and concentration. Inspect way lube reservoirs. Clean chips from the enclosure and way covers.</li><li><strong>Weekly:</strong> Inspect the tool changer mechanism for wear. Check the spindle taper for cleanliness.</li><li><strong>Monthly:</strong> Verify machine level. Inspect all belts and drive components.</li></ul><p>By adhering to these simple steps, our clients have reported machine lifespans extending well beyond industry averages.</p>',
        image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        author: 'Service Department',
        is_published: true
      },
      {
        title: 'The Blueprint: Inside SMG\'s Assembly Line',
        slug: 'blueprint-inside-smg-assembly-line',
        excerpt: 'Take a rare look inside our factory to see how precision engineering transforms raw iron into industrial masterpieces.',
        content: '<p>Every SMG Machine begins its life as a monolithic block of Meehanite cast iron. This heavy, dense material provides the ultimate dampening properties necessary for high-precision machining.</p><p>In this exclusive look behind the scenes, we follow the journey of a VMC 850 from casting, through stress-relieving, hand-scraping of the guideways, and final laser calibration. It is a process that marries century-old craftsmanship with cutting-edge laser metrology.</p>',
        image_url: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        author: 'Factory Floor Lead',
        is_published: true
      }
    ];

    for (const b of blogs) {
      await client.query(`
        INSERT INTO blogs (title, slug, excerpt, content, image_url, author, is_published)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (slug) DO NOTHING
      `, [b.title, b.slug, b.excerpt, b.content, b.image_url, b.author, b.is_published]);
    }

    // Seed stats
    const stats = [
      { label: 'Machines Installed', value: '2500', suffix: '+', icon: 'FaCogs', sort_order: 1 },
      { label: 'Years of Experience', value: '25', suffix: '+', icon: 'FaCalendarAlt', sort_order: 2 },
      { label: 'Countries Served', value: '15', suffix: '+', icon: 'FaGlobe', sort_order: 3 },
      { label: 'Satisfied Clients', value: '500', suffix: '+', icon: 'FaSmile', sort_order: 4 },
    ];

    for (const s of stats) {
      await client.query(`
        INSERT INTO stats (label, value, suffix, icon, sort_order)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING
      `, [s.label, s.value, s.suffix, s.icon, s.sort_order]);
    }

    // Seed certifications
    const certs = [
      { name: 'ISO 9001:2015', issuer: 'Bureau Veritas', year: 2022, sort_order: 1 },
      { name: 'CE Certified', issuer: 'European Conformity', year: 2021, sort_order: 2 },
      { name: 'MSME Registered', issuer: 'Ministry of MSME, India', year: 2010, sort_order: 3 },
    ];

    for (const c of certs) {
      await client.query(`
        INSERT INTO certifications (name, issuer, year, sort_order)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT DO NOTHING
      `, [c.name, c.issuer, c.year, c.sort_order]);
    }

    // Seed admin user
    const passwordHash = await bcrypt.hash('Admin@123', 12);
    await client.query(`
      INSERT INTO admin_users (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
    `, ['SMG Admin', 'admin@smgmachines.com', passwordHash, 'superadmin']);

    await client.query('COMMIT');
    console.log('✅ Seed data inserted successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

seed()
  .then(() => { console.log('Done'); process.exit(0); })
  .catch((err) => { console.error(err); process.exit(1); });
