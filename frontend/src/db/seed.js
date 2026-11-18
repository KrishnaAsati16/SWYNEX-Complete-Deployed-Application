require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const launches = [
  ['Chandrayaan-3', 'LVM3 M4', 'ISRO', 'Satish Dhawan Space Centre, India', '2023-07-14T09:05:00Z', 'success',
    "India's third lunar mission, which included a lander and a rover."],
  ['Artemis I', 'SLS Block 1', 'NASA', 'Kennedy Space Center, USA', '2022-11-16T06:47:00Z', 'success',
    'Uncrewed test flight of the Space Launch System and the Orion spacecraft around the Moon.'],
  ['Arabsat-6A', 'Falcon Heavy', 'SpaceX', 'Kennedy Space Center, USA', '2019-04-11T22:35:00Z', 'success',
    'First commercial flight of Falcon Heavy, carrying a communications satellite.'],
  ['Aditya-L1', 'PSLV-C57', 'ISRO', 'Satish Dhawan Space Centre, India', '2023-09-02T06:20:00Z', 'success',
    "India's first space-based observatory to study the Sun."],
  ['Mars Orbiter Mission', 'PSLV-C25', 'ISRO', 'Satish Dhawan Space Centre, India', '2013-11-05T09:08:00Z', 'success',
    "India's first interplanetary mission, also known as Mangalyaan."],
  ['Gaganyaan G1 (sample entry)', 'LVM3', 'ISRO', 'Satish Dhawan Space Centre, India', '2027-03-01T04:30:00Z', 'upcoming',
    'Sample data: uncrewed test flight for the human spaceflight programme. Date is a placeholder.'],
  ['Demo Mission Delta (sample entry)', 'Demo-1', 'Sample Space Agency', 'Sample Launch Site', '2027-01-15T10:00:00Z', 'delayed',
    'Sample data used to test the delayed status.'],
];

(async () => {
  try {
    // Users: skip if they already exist
    const adminHash = await bcrypt.hash('Admin@12345', 10);
    const userHash = await bcrypt.hash('User@12345', 10);
    await db.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES
         ('Admin', 'admin@example.com', $1, 'admin'),
         ('Demo User', 'user@example.com', $2, 'user')
       ON CONFLICT (email) DO NOTHING`,
      [adminHash, userHash]
    );

    // Launches: reset so running the seed twice does not create duplicates
    await db.query('TRUNCATE launches RESTART IDENTITY CASCADE');
    for (const l of launches) {
      await db.query(
        `INSERT INTO launches (name, rocket, agency, launch_site, launch_date, status, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        l
      );
    }

    console.log(`Seeded ${launches.length} launches.`);
    console.log('Admin login: admin@example.com / Admin@12345');
    console.log('User login:  user@example.com / User@12345');
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    await db.pool.end();
  }
})();
