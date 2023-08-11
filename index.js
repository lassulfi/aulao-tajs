import { app } from "./api.js";

if(process.env.NODE_ENV !== 'test') {
    app.listen(3000, () => console.log('listening at 3000'))
  }