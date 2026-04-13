(function (global) {

var dc = {};

var homeHtmlUrl = "snippets/home-snippet.html";
var allCategoriesUrl = "https://davids-restaurant.herokuapp.com/categories.json";
var categoriesTitleHtml = "snippets/categories-title-snippet.html";
var categoryHtml = "snippets/category-snippet.html";
var menuItemsUrl = "https://davids-restaurant.herokuapp.com/menu_items.json?category=";
var menuItemsTitleHtml = "snippets/menu-items-title.html";
var menuItemHtml = "snippets/menu-item.html";

// Вставка HTML в селектор
var insertHtml = function (selector, html) {
  var targetElem = document.querySelector(selector);
  targetElem.innerHTML = html;
};

// Показ лоадера
var showLoading = function (selector) {
  var html = "<div class='text-center'>";
  html += "<img src='images/ajax-loader.gif'></div>";
  insertHtml(selector, html);
};

// Замена {{propName}} на значение
var insertProperty = function (string, propName, propValue) {
  var propToReplace = "{{" + propName + "}}";
  string = string.replace(new RegExp(propToReplace, "g"), propValue);
  return string;
};

// Скрытие меню при потере фокуса (для мобильных)
document.addEventListener("DOMContentLoaded", function (event) {
  var navButton = document.querySelector("#navbarToggle");
  if (navButton) {
    navButton.addEventListener("blur", function (event) {
      var screenWidth = window.innerWidth;
      if (screenWidth < 768) {
        $("#collapsable-nav").collapse('hide');
      }
    });
  }

  showLoading("#main-content");
  $ajaxUtils.sendGetRequest(allCategoriesUrl, buildAndShowHomeHTML, true);
});

// ГЛАВНАЯ ФУНКЦИЯ - ТУТ ТВОЕ ЗАДАНИЕ
function buildAndShowHomeHTML (categories) {
  $ajaxUtils.sendGetRequest(
    homeHtmlUrl,
    function (homeHtml) {
      // 1. Создаем массив категорий (STEP 0)
      var allCategories = ["L", "D", "SS", "SP", "VG", "DK"];
      
      // 2. Выбираем случайную (STEP 1 & 2)
      var randomCategoryShortName = allCategories[Math.floor(Math.random() * allCategories.length)];

      // 3. Подставляем в шаблон (STEP 3)
      var homeHtmlToInsert = insertProperty(homeHtml, "randomCategoryShortName", "'" + randomCategoryShortName + "'");

      // 4. Вставляем на страницу (STEP 4)
      insertHtml("#main-content", homeHtmlToInsert);
    },
    false);
}

// Загрузка категорий
dc.loadMenuCategories = function () {
  showLoading("#main-content");
  $ajaxUtils.sendGetRequest(allCategoriesUrl, buildAndShowCategoriesHTML);
};

// Загрузка блюд конкретной категории
dc.loadMenuItems = function (categoryShort) {
  showLoading("#main-content");
  $ajaxUtils.sendGetRequest(menuItemsUrl + categoryShort, buildAndShowMenuItemsHTML);
};

// Сборка страницы категорий
function buildAndShowCategoriesHTML (categories) {
  $ajaxUtils.sendGetRequest(categoriesTitleHtml, function (titleHtml) {
    $ajaxUtils.sendGetRequest(categoryHtml, function (catHtml) {
      var viewHtml = buildCategoriesViewHtml(categories, titleHtml, catHtml);
      insertHtml("#main-content", viewHtml);
    }, false);
  }, false);
}

function buildCategoriesViewHtml(categories, titleHtml, catHtml) {
  var finalHtml = titleHtml + "<section class='row'>";
  for (var i = 0; i < categories.length; i++) {
    var html = catHtml;
    html = insertProperty(html, "name", categories[i].name);
    html = insertProperty(html, "short_name", categories[i].short_name);
    finalHtml += html;
  }
  finalHtml += "</section>";
  return finalHtml;
}

// Сборка страницы блюд
function buildAndShowMenuItemsHTML (categoryMenuItems) {
  $ajaxUtils.sendGetRequest(menuItemsTitleHtml, function (titleHtml) {
    $ajaxUtils.sendGetRequest(menuItemHtml, function (mItemHtml) {
      var viewHtml = buildMenuItemsViewHtml(categoryMenuItems, titleHtml, mItemHtml);
      insertHtml("#main-content", viewHtml);
    }, false);
  }, false);
}

function buildMenuItemsViewHtml(categoryMenuItems, titleHtml, mItemHtml) {
  titleHtml = insertProperty(titleHtml, "name", categoryMenuItems.category.name);
  titleHtml = insertProperty(titleHtml, "special_instructions", categoryMenuItems.category.special_instructions);
  var finalHtml = titleHtml + "<section class='row'>";
  var menuItems = categoryMenuItems.menu_items;
  var catShortName = categoryMenuItems.category.short_name;

  for (var i = 0; i < menuItems.length; i++) {
    var html = mItemHtml;
    html = insertProperty(html, "short_name", menuItems[i].short_name);
    html = insertProperty(html, "catShortName", catShortName);
    html = insertItemPrice(html, "price_small", menuItems[i].price_small);
    html = insertItemPortionName(html, "small_portion_name", menuItems[i].small_portion_name);
    html = insertItemPrice(html, "price_large", menuItems[i].price_large);
    html = insertItemPortionName(html, "large_portion_name", menuItems[i].large_portion_name);
    html = insertProperty(html, "name", menuItems[i].name);
    html = insertProperty(html, "description", menuItems[i].description);

    if (i % 2 !== 0) html += "<div class='clearfix visible-lg-block visible-md-block'></div>";
    finalHtml += html;
  }
  finalHtml += "</section>";
  return finalHtml;
}

function insertItemPrice(html, pricePropName, priceValue) {
  if (!priceValue) return insertProperty(html, pricePropName, "");
  return insertProperty(html, pricePropName, "$" + priceValue.toFixed(2));
}

function insertItemPortionName(html, portionPropName, portionValue) {
  if (!portionValue) return insertProperty(html, portionPropName, "");
  return insertProperty(html, portionPropName, "(" + portionValue + ")");
}

global.$dc = dc;

})(window);
