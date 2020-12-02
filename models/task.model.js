module.exports = mongoose => {
  const Task = mongoose.model(
    "task",
    mongoose.Schema(
      {
        title: String,
        description: String,
        frequency: String,
        scope: String,
        points: Number,
        status: String
      },
      { timestamps: true }
    )
  );

  return Task;
};