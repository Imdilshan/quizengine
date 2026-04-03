const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    totalScore: {
      type: Number,
      default: 0,
    },
    progress: {
      type: Map,
      of: new mongoose.Schema({
        completed: { type: Boolean, default: false },
        bestScore: { type: Number, default: 0 },
        attempts: { type: Number, default: 0 },
      }),
      default: {},
    },
    avatar: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.updateTopicProgress = function (topicId, score, passed) {
  const existing = this.progress.get(topicId) || { completed: false, bestScore: 0, attempts: 0 };
  this.progress.set(topicId, {
    completed: existing.completed || passed,
    bestScore: Math.max(existing.bestScore, score),
    attempts: existing.attempts + 1,
  });
};
module.exports = mongoose.model("User", userSchema);
