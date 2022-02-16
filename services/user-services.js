// 引入模組
const bcrypt = require('bcryptjs')
const { User } = require('../models')

const userServices = {
  // 註冊模組
  signUp: (req, cb) => {
    // 若password與passwordCheck不一致，建立一個Error物件並拋出
    if (req.body.password !== req.body.passwordCheck) throw new Error('Passwords do not match!')

    User.findOne({ where: { email: req.body.email } })
      .then(user => {
        // 確認資料庫是否有一樣的email，若有建立一個Error物件並拋出
        if (user) throw new Error('Email already exists!')

        // 若無建立密碼雜湊，並將資料新增至資料庫，最後重新導向signin頁面
        return bcrypt.hash(req.body.password, 10)
      })
      .then(hash => User.create({
        name: req.body.name,
        email: req.body.email,
        password: hash
      }))
      .then(newUser => {
        cb(null, { user: newUser.toJSON() }) // 回傳user資料
      })
      .catch(err => cb(err)) // 接住前面拋出的錯誤，呼叫專門做錯誤處理的 middleware
  }
}

// 匯出模組
module.exports = userServices
