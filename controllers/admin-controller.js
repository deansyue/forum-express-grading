// 引入model
const { Restaurant } = require('../models')

const adminController = {
  // 瀏覽後台網頁
  getRestaurants: (req, res, next) => {
    // 查詢Restaurant所有資料
    Restaurant.findAll({
      // 去除sequelize物件實例
      raw: true
    })
      // 渲染admin/restaurants畫面
      .then(restaurants => res.render('admin/restaurants', { restaurants }))
      .catch(err => next(err))
  },

  // 渲染新增餐廳頁面
  createRestaurant: (req, res) => {
    return res.render('admin/create-restaurant')
  },

  // 新增餐廳路由
  postRestaurant: (req, res, next) => {
    // 取得表單資料
    const { name, tel, address, description, openingHours } = req.body

    // 判斷name欄位是否有值，若無則丟出Error物件
    if (!name) throw new Error('Restaurant name is required')

    // 判斷name有值後，新增資料至資料庫
    Restaurant.create({
      name,
      tel,
      address,
      description,
      openingHours
    })
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
      raw: true
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
    // 查詢資料庫是否有動態路由所填的id值
    Restaurant.findByPk(req.params.rest_id, {
      // 將資料轉換成js原生物件
      raw: true
    })
      .then(restaurant => {
        // 判斷是否有查詢到資料，若無則丟出一個Error物件
        if (!restaurant) throw new Error("Restaurant didn't exists!")

        // 若有資料渲染admin/restaurant頁面
        res.render('admin/edit-restaurant', { restaurant })
      })
      .catch(err => next(err))
  },

  // 修改資料庫資料路由
  putRestaurant: (req, res, next) => {
    // 取得表單資料
    const { name, tel, address, openingHours, description } = req.body

    // 判斷name是否有填值，若無丟出Error物件
    if (!name) throw new Error('Restaurant name is required!')

    // 使用動態id查詢資料庫資料
    Restaurant.findByPk(req.params.rest_id)
      .then(restaurant => {
        // 判斷是否有資料，若無丟出Error物件
        if (!restaurant) throw new Error("Restaurant didn't exists!")

        // 若有資料，則更新資料庫資料內容
        return restaurant.update({
          name,
          tel,
          address,
          openingHours,
          description
        })
      })
      .then(() => {
        // 回傳成功訊息，並導向admin/restaurants
        req.flash('success_messages', 'restaurant was successfully updated!')
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
  }
}

// 匯出模組
module.exports = adminController
