module.exports = mongoose => {
  const CTask = mongoose.model(
    "complete_task",
    mongoose.Schema(
      {
        task_id: String,
        user_id: String,
        recurringType: String,
        notes: String,
        complete_date: Date

      }
    )
  );

  return CTask;
};