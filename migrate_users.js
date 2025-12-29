import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { users } from "./db.js";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const migrate = async () => {
  console.log("Starting migration...");
  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const { data, error } = await supabase.from("users").insert({
      name: user.name,
      email: user.email,
      password: hashedPassword,
    });

    if (error) {
      console.error(`Error migrating user ${user.email}:`, error.message);
    } else {
      console.log(`Migrated user ${user.email}`);
    }
  }
  console.log("Migration complete.");
};

migrate();
