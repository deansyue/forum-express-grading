const { User, Restaurant, Comment } = require('../../models')

const CommentController = {
  getComment: (req, res, next) => {
    const length = req.query.length ? Number(req.query.length) : null
    Comment.findAll({
      where: {
        ...req.params.restId ? { restaurantId: req.params.restId } : {}
      },
      limit: length,
      order: length ? [['createdAt', 'DESC']] : [],
      raw: true
    })
      .then(comment => {
        res.json({ status: 'success', data: { comment } })
      })
      .catch(err => next(err))
  },

  // 新增評論
  postComment: (req, res, next) => {
    // 取得表單資料
    const { text, restaurantId } = req.body
    // 取得使用者id
    const userId = req.user.id

    // 判斷text是否有值，無值回傳錯誤訊息
    if (!text) throw new Error('Comment text is required!')

    // 查詢user與restaurant資料
    return Promise.all([
      User.findByPk(userId, { raw: true }),
      Restaurant.findByPk(restaurantId, { raw: true })
    ])
      .then(([user, restaurant]) => {
        // 判斷user與restaurant是否有值，若無回傳錯誤訊息
        if (!user) throw new Error("User didn't exists!")
        if (!restaurant) throw new Error("Restaurant didn't exists!")

        // 新增comment資料庫
        return Comment.create({
          text,
          userId,
          restaurantId
        })
      })
      .then(newComment => res.json({ status: 'success', data: { comment: newComment } })) // 重新導向該餐廳詳細頁面
      .catch(err => next(err))
  },

  // 刪除評論
  deleteComment: (req, res, next) => {
    // 查詢動態路由的comment資料
    return Comment.findByPk(req.params.id)
      .then(comment => {
        // 判斷是否有該資料，無回傳錯誤訊息
        if (!comment) throw new Error("Comment didn't exists!")

        // 刪除資料庫資料
        return comment.destroy()
      })
      .then(deletedComment => res.json({ status: 'success', data: { comment: deletedComment } })) // 動新導向刪除評論的餐廳詳細頁面
      .catch(err => next(err))
  }
}

module.exports = CommentController
