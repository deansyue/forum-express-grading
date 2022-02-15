const jwt = require('jsonwebtoken')

const userController = {
  // 登入路由
  signIn: (req, res, next) => {
    try {
      // 將req.user轉換成普通物件
      const userData = req.user.toJSON()
      // 刪除userData裡的password資料
      delete userData.password
      // 簽發token， token含req.user資料，並用JWT_SECRET金鑰加上 header 和 payload 進行雜湊，該token效期為30天
      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30d' })

      // 回傳json物件，資料有status，data有token與user資料
      res.json({
        status: 'success',
        data: {
          token,
          user: userData
        }
      })
    } catch (err) {
      next(err)
    }
  }
}

// 匯出模組
module.exports = userController
