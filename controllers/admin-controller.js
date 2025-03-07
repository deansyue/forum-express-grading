// 引入model
const { Restaurant, User, Category } = require('../models')
// 引入file-helpers
const { imgurFileHandler } = require('../helpers/file-helpers')

const adminController = {
  // 瀏覽後台網頁
  getRestaurants: (req, res, next) => {
    // 查詢Restaurant所有資料
    Restaurant.findAll({
      // 去除sequelize物件實例
      raw: true,
      // 將關連的資料包成一個物件
      nest: true,
      // 關連Category
      include: [Category]
    })
      // 渲染admin/restaurants畫面
      .then(restaurants => res.render('admin/restaurants', { restaurants }))
      .catch(err => next(err))
  },

  // 渲染新增餐廳頁面
  createRestaurant: (req, res, next) => {
    // 查詢所有category資料
    return Category.findAll({
      raw: true
    })
      .then(categories => res.render('admin/create-restaurant', { categories })) // 渲染create-restaurant，並帶入category資料
      .catch(err => next(err))
  },

  // 新增餐廳路由
  postRestaurant: (req, res, next) => {
    // 取得表單資料
    const { name, tel, address, description, openingHours, categoryId } = req.body

    // 判斷name欄位是否有值，若無則丟出Error物件
    if (!name) throw new Error('Restaurant name is required')

    // 取得在middleware/multer處理過放在req.file裡的圖片資料
    const { file } = req

    // 呼叫localFileHandler處理圖片檔案
    imgurFileHandler(file)
      // 取得圖片路徑後，將全部資料新增至資料庫
      .then(filePath => Restaurant.create({
        name,
        tel,
        address,
        description,
        openingHours,
        image: filePath || null,
        categoryId
      }))
      .then(() => {
        // 回傳成功訊息，並導向admin/restaurants
        req.flash('success_messages', 'restaurant was successfully created')
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
  },

  // 查看餐廳詳細資料的路由
  getRestaurant: (req, res, next) => {
    // 查詢資料庫是否有動態路由所填的id值
    Restaurant.findByPk(req.params.rest_id, {
      // 將資料轉換成js原生物件
      raw: true,
      // 將關連的資料包成一個物件
      nest: true,
      // 關連Category
      include: [Category]
    })
      .then(restaurant => {
        // 判斷是否有查詢到資料，若無則丟出一個Error物件
        if (!restaurant) throw new Error("Restaurant didn't exists!")

        // 若有資料渲染admin/restaurant頁面
        res.render('admin/restaurant', { restaurant })
      })
      .catch(err => next(err))
  },

  // 渲染修改頁面
  editRestaurant: (req, res, next) => {
    return Promise.all([
      // 查詢資料庫是否有動態路由所填的id值
      Restaurant.findByPk(req.params.rest_id, { raw: true }),
      // 查詢所有category資料
      Category.findAll({ raw: true })
    ])
      .then(([restaurant, categories]) => {
        // 判斷是否有查詢到資料，若無則丟出一個Error物件
        if (!restaurant) throw new Error("Restaurant didn't exists!")

        // 若有資料渲染admin/restaurant頁面
        res.render('admin/edit-restaurant', { restaurant, categories })
      })
      .catch(err => next(err))
  },

  // 修改資料庫資料路由
  putRestaurant: (req, res, next) => {
    // 取得表單資料
    const { name, tel, address, openingHours, description, categoryId } = req.body

    // 判斷name是否有填值，若無丟出Error物件
    if (!name) throw new Error('Restaurant name is required!')

    // 取得在middleware/multer處理過放在req.file裡的圖片資料
    const { file } = req

    // 使用promise.all先處理兩件非同步事件
    Promise.all([
      // 使用動態id查詢資料庫資料
      Restaurant.findByPk(req.params.rest_id),
      // 呼叫localFileHandler處理圖片檔案
      imgurFileHandler(file)
    ])
      .then(([restaurant, filePath]) => { // 取得promise.all先處理的兩樣回傳參數
        // 判斷是否有資料，若無丟出Error物件
        if (!restaurant) throw new Error("Restaurant didn't exists!")

        // 若有資料，則更新資料庫資料內容
        return restaurant.update({
          name,
          tel,
          address,
          openingHours,
          description,
          image: filePath || restaurant.image, // 如果filePath有值就更新成filePath， 若沒有值維特更新前的image
          categoryId
        })
      })
      .then(() => {
        // 回傳成功訊息，並導向admin/restaurants
        req.flash('success_messages', 'restaurant was successfully updated!')
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
  },

  // 刪除資料路由
  deleteRestaurant: (req, res, next) => {
    // 使用動態id查詢資料庫資料
    return Restaurant.findByPk(req.params.rest_id)
      .then(restaurant => {
        // 判斷是否有資料，若無丟出Error物件
        if (!restaurant) throw new Error("Restaurant didn't exists!")

        // 若有資料，刪除該資料
        return restaurant.destroy()
      })
      // 重新導向admin/restaurants
      .then(() => res.redirect('/admin/restaurants'))
      .catch(err => next(err))
  },

  // 渲染admin/users頁面
  getUsers: (req, res, next) => {
    // 查詢user table所有資料
    return User.findAll({
      // 將資料轉換成js原生物件
      raw: true
    })
      .then(users => {
        // 遍歷所有user，判斷isAdmin
        // 若是admin，新增role value為admin，非admin role value為user
        users.forEach(user => {
          user.role = user.isAdmin ? 'admin' : 'user'
        })
        // 渲染admin/users頁面， 傳入users參數
        res.render('admin/users', { users })
      })
      .catch(err => next(err))
  },

  patchUser: (req, res, next) => {
    // 取得動態路由被修改使用者的id資料
    const id = req.params.id
    // 查詢被修改使用者資料
    return User.findByPk(id)
      .then(modifyUser => {
        // 判斷是否有資料，若無丟出Error物件
        if (!modifyUser) throw new Error("User didn't exists!")
        // 判斷是否為最高權限信箱
        if (modifyUser.email === 'root@example.com') {
          // 回傳錯誤資訊
          req.flash('error_messages', '禁止變更 root 權限')
          // 回到上一頁
          return res.redirect('back')
        }

        // 修改權限並回存資料庫
        return modifyUser.update({
          isAdmin: !modifyUser.isAdmin
        })
          .then(() => {
            // 回傳成功資訊
            req.flash('success_messages', '使用者權限變更成功')
            // 重新導向/admin/users
            return res.redirect('/admin/users')
          })
      })
  }
}

// 匯出模組
module.exports = adminController
