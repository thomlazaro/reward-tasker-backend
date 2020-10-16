module.exports = mongoose => {
  const Task = mongoose.model(
    "task",
    mongoose.Schema(
      {
        taskName: String,
        recurringType: String,
        scope: String,
        points: Number
      },
      { timestamps: true }
    )
  );

  return Task;
};