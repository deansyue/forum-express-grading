// 引入model
const { Restaurant, Category } = require('../../models')
const { getOffset, getPagination } = require('../../helpers/pagination-helper')

const restaurantController = {
  // 瀏覽餐廳頁面
  getRestaurants: (req, res, next) => {
    // 宣告預設limit變數
    const DEFAULT_LIMIT = 9

    // 取得查詢條資料
    const categoryId = Number(req.query.categoryId) || '' // 查詢條件為字串，先將資料轉成數值再操作
    const page = Number(req.query.page) || 1 // 若無page條件，預設為1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT // 若無limit條件，預設為DEFAULT_LIMIT

    const offset = getOffset(limit, page)

    Promise.all([
      // 尋找全部restaurant資料，並關連category
      Restaurant.findAndCountAll({
        include: Category,
        // 增加查詢條件
        where: {
          ...categoryId ? { categoryId } : {} // 若categoryId為true，回傳物件categoryId，若無回傳空物件，再使用展開運算子展開物件
        },
        limit,
        offset,
        nest: true,
        raw: true
      }),
      // 尋找全部category資料
      Category.findAll({ raw: true })
    ])
      .then(([restaurants, categories]) => {
        // 先檢查req.user是否有資料，若有則將FavoritedRestaurants的餐廳id取出成陣列
        const favoritedRestaurantsId = req.user?.FavoritedRestaurants ? req.user.FavoritedRestaurants.map(fr => fr.id) : []
        // 先檢查req.user是否有資料，若有則將LikedRestaurants的餐廳id取出成陣列
        const likedRestaurantsId = req.user?.LikedRestaurants ? req.user.LikedRestaurants.map(lr => lr.id) : []

        // 新增變數data，取得map回傳陣列
        const data = restaurants.rows.map(r => ({
          ...r, // 展開r的物件
          description: r.description.substring(0, 50), // 將餐廳描述截為50字
          isFavorited: favoritedRestaurantsId.includes(r.id), // 判斷favoritedRestaurantsId是否有包含目前餐廳的id，並回傳boolean值
          isLiked: likedRestaurantsId.includes(r.id) // 判斷likedRestaurantsId是否有包含目前餐廳的id，並回傳boolean值
        }))
        // 渲染restaurants
        return res.json({
          restaurants: data,
          categories,
          categoryId,
          pagination: getPagination(limit, page, restaurants.count)
        })
      })
      .catch(err => next(err))
  }
}

// 匯出模組
module.exports = restaurantController
