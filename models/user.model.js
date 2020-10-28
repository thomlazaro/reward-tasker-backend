module.exports = mongoose => {
  const User = mongoose.model(
    "user",
    mongoose.Schema(
      {
        userid: String,
        username: String,
        password: String,
        fullname: String,
        team: String,
        role: String
      },
      { timestamps: true }
    )
  );

  return User;
};