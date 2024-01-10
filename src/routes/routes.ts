const roots = {
  task: '/task',
};

export const ROUTES = {
  TASK: {
    ROOT: roots.task,
    CREATE_task: {
      URL: '',
      DESCRIPTION: 'create task',
    },
    GET_task: {
      URL: '',
      DESCRIPTION: 'get all task',
    },
    UPLOAD_task_File: {
      URL: '/upload',
      DESCRIPTION: 'upload task file',
    },
    GET_task_BY_ID: {
      URL: '/:taskId',
      DESCRIPTION: 'get task by id',
      PARAM: 'taskId',
    },
    UPDATE_task_BY_ID: {
      URL: '/:taskId',
      DESCRIPTION: 'update task by id',
      PARAM: 'taskId',
    },
    DELETE_task_BY_ID: {
      URL: '/:taskId',
      DESCRIPTION: 'delete task by id',
      PARAM: 'taskId',
    },
  },
};
