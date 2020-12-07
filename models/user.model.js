module.exports = mongoose => {
  const User = mongoose.model(
    "user",
    mongoose.Schema(
      {
        username: String,
        fullname: String,
        team: [String],
        role: String
      },
      { timestamps: true }
    )
  );

  return User;
};