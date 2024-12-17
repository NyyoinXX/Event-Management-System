const express = require("express");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { Pool } = require("pg");

const app = express();
const jwtSecret = "your_jwt_secret";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, 
  },
});

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: "https://event-management-system-faf2.onrender.com", 
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  },
});
const upload = multer({ storage });

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const user = jwt.verify(token, jwtSecret);
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

const createDefaultAdmin = async () => {
  try {
    const query = `SELECT * FROM "Users" WHERE role = $1 LIMIT 1`;
    const result = await pool.query(query, ["admin"]);

    if (result.rowCount === 0) {
      const insertQuery = `
        INSERT INTO "Users" (name, email, password, role, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, NOW(), NOW());
      `;
      const values = [
        "Admin",
        "admin@example.com",
        bcrypt.hashSync("admin123", 10),
        "admin",
      ];
      await pool.query(insertQuery, values);
      console.log("Default admin created");
    }
  } catch (error) {
    console.error("Error creating default admin:", error);
  }
};


const createUsersTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Users" (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Users table created or already exists');
  } catch (error) {
    console.error('Error creating Users table:', error);
    throw error;
  }
};

const createEventsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Events" (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        time TIME NOT NULL,
        location VARCHAR(255) NOT NULL,
        organizer VARCHAR(255) NOT NULL,
        category VARCHAR(50) CHECK (category IN ('CLUB_ACTIVITY', 'WORKSHOP', 'SEMINAR')) NOT NULL,
        capacity INTEGER NOT NULL CHECK (capacity > 0),
        image VARCHAR(255),
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Events table created or already exists');
  } catch (error) {
    console.error('Error creating Events table:', error);
    throw error;
  }
};

const createRSVPsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "RSVPs" (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES "Users"(id),
        event_id INTEGER REFERENCES "Events"(id),
        status VARCHAR(20) CHECK (status IN ('ATTENDING', 'UNAVAILABLE')),
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, event_id)
      );
    `);
    console.log('RSVPs table created or already exists');
  } catch (error) {
    console.error('Error creating RSVPs table:', error);
    throw error;
  }
};

const initializeDatabase = async () => {
  try {
    await createUsersTable();
    await createEventsTable();
    await createRSVPsTable();
    await createDefaultAdmin();
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
};

pool.connect()
  .then(() => {
    console.log("Database connected");
    initializeDatabase();
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });

app.get("/test", (req, res) => res.json("test ok"));

app.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO "Users" (name, email, password, role, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id, name, email, role;
    `;
    const values = [name, email, hashedPassword, role || "user"];

    const result = await pool.query(query, values);
    res.status(201).json({ message: "Registration successful", user: result.rows[0] });
  } catch (error) {
    if (error.code === "23505") {
      res.status(400).json({
        error: "Duplicate entry",
        details: "This email is already registered. Please log in instead.",
      });
    } else {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed", details: error.message });
    }
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const query = `SELECT id, name, email, password, role FROM "Users" WHERE email = $1;`;
    const result = await pool.query(query, [email]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];
    const passOk = await bcrypt.compare(password, user.password);

    if (!passOk) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000
    });

    const { password: _, ...userWithoutPassword } = user;
    res.json({
      message: "Login successful",
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/createEvent", authenticateToken, requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const { title, date, time, location, description, organizer, category, capacity } = req.body;
    const imagePath = req.file ? req.file.filename : null;

    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }

    const query = `
      INSERT INTO "Events" (
        title, date, time, location, description,
        organizer, category, capacity, image, "createdAt", "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *;
    `;

    const values = [
      title, 
      date, 
      time, 
      location, 
      description, 
      organizer,
      category.toUpperCase(),
      parseInt(capacity, 10), 
      imagePath
    ];

    const result = await pool.query(query, values);

    if (!result.rows[0]) {
      throw new Error('Failed to create event');
    }

    res.status(201).json({
      message: "Event created successfully",
      event: result.rows[0]
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({
      error: "Failed to create event",
      details: error.message
    });
  }
});

app.get("/events", async (req, res) => {
  try {
    const query = `
      SELECT 
        id, title, description, date, time, 
        location, organizer, category, image, 
        "createdAt", "updatedAt"
      FROM "Events" 
      ORDER BY "createdAt" DESC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch events:", error);
    res.status(500).json({ error: "Failed to fetch events", details: error.message });
  }
});

app.get("/event/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT 
        id,
        title,
        description,
        date,
        time,
        location,
        organizer,
        category,
        capacity,
        image,
        "createdAt",
        "updatedAt"
      FROM "Events" 
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    const event = {
      ...result.rows[0],
      imageUrl: result.rows[0].image ? `/uploads/${result.rows[0].image}` : null
    };

    res.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Failed to fetch event", details: error.message });
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
});

app.get('/uploads/:filename', (req, res) => {
  const { filename } = req.params;
  res.sendFile(path.join(__dirname, 'uploads', filename));
});


app.get("/event/:id/rsvps", async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT r.*, u.name as user_name 
      FROM "RSVPs" r
      JOIN "Users" u ON r.user_id = u.id
      WHERE r.event_id = $1
    `;
    const result = await pool.query(query, [id]);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching RSVPs:", error);
    res.status(500).json({ error: "Failed to fetch RSVPs" });
  }
});

app.post("/event/:id/rsvp", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const eventCheck = await pool.query('SELECT id FROM "Events" WHERE id = $1', [id]);
    if (eventCheck.rowCount === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    const checkQuery = `SELECT * FROM "RSVPs" WHERE user_id = $1 AND event_id = $2`;
    const existing = await pool.query(checkQuery, [userId, id]);

    let result;
    if (existing.rowCount > 0) {
      const updateQuery = `
        UPDATE "RSVPs" 
        SET status = $1, "updatedAt" = NOW()
        WHERE user_id = $2 AND event_id = $3
        RETURNING *
      `;
      result = await pool.query(updateQuery, [status, userId, id]);
    } else {
      const insertQuery = `
        INSERT INTO "RSVPs" (user_id, event_id, status, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, NOW(), NOW())
        RETURNING *
      `;
      result = await pool.query(insertQuery, [userId, id, status]);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating RSVP:", error);
    res.status(500).json({ error: "Failed to update RSVP" });
  }
});

app.get("/event/:id/my-rsvp", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const query = `SELECT * FROM "RSVPs" WHERE user_id = $1 AND event_id = $2`;
    const result = await pool.query(query, [userId, id]);

    res.json(result.rows[0] || null);
  } catch (error) {
    console.error("Error fetching RSVP:", error);
    res.status(500).json({ error: "Failed to fetch RSVP" });
  }
});

app.delete("/event/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM "RSVPs" WHERE event_id = $1', [id]);

    const result = await pool.query('DELETE FROM "Events" WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (result.rows[0].image) {
      const imagePath = path.join(__dirname, 'uploads', result.rows[0].image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

app.get("/user/:userId/rsvps", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const query = `
      SELECT e.*, r.status
      FROM "Events" e
      JOIN "RSVPs" r ON e.id = r.event_id
      WHERE r.user_id = $1
      ORDER BY e.date ASC
    `;
    
    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching user RSVPs:", error);
    res.status(500).json({ error: "Failed to fetch RSVPs" });
  }
});

app.get("/admin/event-responses", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const query = `
      SELECT 
        e.id as event_id,
        e.title as event_title,
        json_agg(json_build_object(
          'id', u.id,
          'name', u.name,
          'email', u.email,
          'status', r.status
        )) as attendees,
        COUNT(*) as total,
        COUNT(CASE WHEN r.status = 'ATTENDING' THEN 1 END) as attending,
        COUNT(CASE WHEN r.status = 'UNAVAILABLE' THEN 1 END) as unavailable
      FROM "Events" e
      LEFT JOIN "RSVPs" r ON e.id = r.event_id
      LEFT JOIN "Users" u ON r.user_id = u.id
      GROUP BY e.id, e.title
      ORDER BY e.date DESC
    `;
    
    const result = await pool.query(query);
    
    const formattedResponse = result.rows.reduce((acc, row) => {
      acc[row.event_id] = {
        eventTitle: row.event_title,
        total: parseInt(row.total),
        attending: parseInt(row.attending),
        unavailable: parseInt(row.unavailable),
        attendees: row.attendees.filter(a => a.id !== null) 
      };
      return acc;
    }, {});

    res.json(formattedResponse);
  } catch (error) {
    console.error("Error fetching event responses:", error);
    res.status(500).json({ error: "Failed to fetch event responses" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
