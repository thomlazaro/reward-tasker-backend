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
        status: String,
        duedate: Date
      },
      { timestamps: true }
    )
  );

  return Task;
};