import Message from './src/message'

Message.install = (app) => {
    app.config.globalProperties.$message = Message
}

export default Message