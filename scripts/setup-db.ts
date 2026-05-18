import { db } from '../src/lib/db.server.ts';
import 'dotenv/config';

async function setup() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is missing in .env");
    process.exit(1);
  }

  console.log("🚀 Initializing Neon Postgres schema...");

  try {
    // Create Shipments table
    await db.query(`
      CREATE TABLE IF NOT EXISTS shipments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tracking_number TEXT UNIQUE NOT NULL,
        status TEXT NOT NULL,
        origin_city TEXT,
        origin_country TEXT,
        origin_lat FLOAT,
        origin_lng FLOAT,
        current_city TEXT,
        current_country TEXT,
        current_lat FLOAT,
        current_lng FLOAT,
        destination_city TEXT,
        destination_country TEXT,
        destination_lat FLOAT,
        destination_lng FLOAT,
        sender_name TEXT,
        sender_city TEXT,
        sender_country TEXT,
        sender_phone TEXT,
        sender_email TEXT,
        receiver_name TEXT,
        receiver_city TEXT,
        receiver_country TEXT,
        receiver_phone TEXT,
        receiver_email TEXT,
        receiver_address TEXT,
        package_title TEXT,
        package_weight TEXT,
        package_quantity INTEGER,
        shipping_method TEXT,
        priority TEXT,
        estimated_delivery TEXT,
        duty_fees TEXT,
        clearance_fee TEXT,
        is_paused BOOLEAN DEFAULT false,
        hold_reason TEXT,
        images TEXT[], -- Array of image URLs
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Updates table
    await db.query(`
      CREATE TABLE IF NOT EXISTS shipment_updates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
        status TEXT NOT NULL,
        location TEXT NOT NULL,
        description TEXT,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Schema created successfully!");
  } catch (err) {
    console.error("❌ Setup failed:", err);
  } finally {
    process.exit(0);
  }
}

setup();
