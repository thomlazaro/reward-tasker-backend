module.exports = mongoose => {
  const schema = mongoose.Schema;
  const CTask = mongoose.model(
    "complete_task",
    mongoose.Schema(
      {
        taskid: [{ type: schema.Types.ObjectId, ref: 'task' }],
        userid: [{ type: schema.Types.ObjectId, ref: 'user' }],
        comments: String,
        completionDate: Date
      }
    )
  );

  return CTask;
};