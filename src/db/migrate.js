const pool = require('./pool');

const createTables = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Products categories
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        icon VARCHAR(100),
        image_url TEXT,
        is_active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Products
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        name VARCHAR(500) NOT NULL,
        slug VARCHAR(500) NOT NULL UNIQUE,
        short_description TEXT,
        description TEXT,
        specifications JSONB DEFAULT '{}',
        features TEXT[],
        images TEXT[],
        main_image TEXT,
        is_featured BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        meta_title VARCHAR(500),
        meta_description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Enquiries / Contact form
    await client.query(`
      CREATE TABLE IF NOT EXISTS enquiries (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        company VARCHAR(255),
        subject VARCHAR(500),
        message TEXT NOT NULL,
        product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
        status VARCHAR(50) DEFAULT 'new',
        is_read BOOLEAN DEFAULT false,
        replied_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Newsletter subscribers
    await client.query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        subscribed_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Admin users
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Testimonials
    await client.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY,
        client_name VARCHAR(255) NOT NULL,
        company VARCHAR(255),
        designation VARCHAR(255),
        message TEXT NOT NULL,
        rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
        avatar_url TEXT,
        is_active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Achievements / Stats
    await client.query(`
      CREATE TABLE IF NOT EXISTS stats (
        id SERIAL PRIMARY KEY,
        label VARCHAR(255) NOT NULL,
        value VARCHAR(100) NOT NULL,
        suffix VARCHAR(50),
        icon VARCHAR(100),
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true
      );
    `);

    // Hero slides / Banners
    await client.query(`
      CREATE TABLE IF NOT EXISTS banners (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500),
        subtitle TEXT,
        cta_text VARCHAR(255),
        cta_link VARCHAR(500),
        image_url TEXT,
        is_active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Certifications
    await client.query(`
      CREATE TABLE IF NOT EXISTS certifications (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        issuer VARCHAR(255),
        image_url TEXT,
        year INTEGER,
        is_active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0
      );
    `);

    // Blogs
    await client.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        slug VARCHAR(500) NOT NULL UNIQUE,
        excerpt TEXT,
        content TEXT NOT NULL,
        image_url TEXT,
        author VARCHAR(255),
        is_published BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query('COMMIT');
    console.log('✅ All tables created successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

createTables()
  .then(() => {
    console.log('Migration complete');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
