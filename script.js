window.addEventListener('load', function () {
  // テキストスプライトを格納する配列
  let textSpriteArr = [];
  // Canvasのサイズ
  const WIDTH = 1000;
  const HEIGHT = 500;
  // Pixiアプリケーションの生成
  let pixiApp = new PIXI.Application({ 
    width: WIDTH,
    height: HEIGHT,
    antialias: true,
    backgroundColor: 0xffffff, 
  });
  // Pixiアプリケーションのビュー(canvas要素)を追加
  document.getElementById('app').appendChild((pixiApp.view));

  // イベント
  document.getElementById('input-button').addEventListener('click', addText);
  document.getElementById('input-text').addEventListener('keypress', function (event) {
    // [Enter]キーを押した場合
    if (event.key === 'Enter') {
      addText();
    }
  });

  // テキストスプライトを追加する関数
  function addText() {
    // 文字列の取得
    let inputText = document.getElementById('input-text').value;
    document.getElementById('input-text').value = '';
    // 空文字も場合
    if (inputText == '') {
      return;
    }
    // テキストスプライトを格納する変数
    let textSprite = null;
    // 一つ目
    if (textSpriteArr.length === 0) {
      // テキストスプライトを生成
      textSprite = createTextSprite(inputText);
    } else {
      // フラグ
      let flag = false;
      // ループ数
      let i = 0;
      while (flag === false) {
        i++;
        flag = true;
        // テキストスプライトを生成
        textSprite = createTextSprite(inputText);
        textSpriteArr.forEach(function(target) {
          if (checkHitRectangle(textSprite, target)) {
            flag = false;
            console.log('当たり');
          }
        });
        if (i > 2000) {
          console.log('break');
          break;
        }
      }
    }
    // テキストスプライトをステージに追加
    pixiApp.stage.addChild(textSprite);
    // テキストスプライトを配列に格納
    textSpriteArr.push(textSprite);
  }

  // テキストスプライトを生成する関数
  function createTextSprite(str) {
    // テクストスプライトの生成
    let textSprite = new PIXI.Text(str, {
      fontSize: 20,
      fontWeight: 'normal',
      fill: 0x000000,
    });
    // インタラクティブをONにする
    textSprite.interactive = true;
    // マウスポインタをハンド型にする
    textSprite.buttonMode = true;
    // イベント設定
    textSprite.on('pointerover', function () {
      this.style.fill = 0x0000ff;
    });
    textSprite.on('pointerout', function () {
      this.style.fill = 0x000000;
    });
    textSprite.clickCount = 0;
    textSprite.on('pointerdown', function () {
      this.mouseMoved = false;
    });
    textSprite.on('pointermove', function () {
      this.mouseMoved = true;
    });
    textSprite.on('pointerup', function () {
      let textSprite = this;
      if (!textSprite.mouseMoved) {
        textSprite.clickCount++;
        if (textSprite.clickCount === 1) {
          setTimeout(function () {
            // クリック時の処理
            if (textSprite.clickCount === 1) {
              textSprite.clickCount = 0;
              // ラインの表示/非表示
              lineGraphics = textSprite.getChildAt(0);
              if (lineGraphics.alpha === 0) {
                lineGraphics.alpha = 1;
              } else {
                lineGraphics.alpha = 0;
              }
            } else {
              textSprite.clickCount = 0;
            }
          }, 150);
        }
        // ダブルクリック時の処理
        if (textSprite.clickCount === 2) {
          // ステージからテキストスプライトを削除
          pixiApp.stage.removeChild(textSprite);
          // 配列内からテキストスプライトを削除
          let index = textSpriteArr.indexOf(textSprite);
          textSpriteArr.splice(index, 1);
        }
      }
    });
    // テキストスプライトの回転
    textSprite.rotation = random(0, 360) * Math.PI / 180;
    // 矩形の4頂点の座標を取得
    textSprite.points = getPointsRectangle(textSprite);
    // テキストスプライトの範囲座標
    let left, top, right, bottom;
    if (0 <= textSprite.rotation && textSprite.rotation < Math.PI * 0.5) {
      left   = textSprite.points[1].x;
      top    = textSprite.points[0].y;
      right  = textSprite.points[3].x;
      bottom = textSprite.points[2].y;
    }
    if (Math.PI * 0.5 <= textSprite.rotation && textSprite.rotation < Math.PI) {
      left   = textSprite.points[2].x;
      top    = textSprite.points[1].y;
      right  = textSprite.points[0].x;
      bottom = textSprite.points[3].y;
    }
    if (Math.PI <= textSprite.rotation && textSprite.rotation < Math.PI * 1.5) {
      left   = textSprite.points[3].x;
      top    = textSprite.points[2].y;
      right  = textSprite.points[1].x;
      bottom = textSprite.points[0].y;
    }
    if (Math.PI * 1.5 <= textSprite.rotation && textSprite.rotation < Math.PI * 2) {
      left   = textSprite.points[0].x;
      top    = textSprite.points[3].y;
      right  = textSprite.points[2].x;
      bottom = textSprite.points[1].y;
    }
    // テキストスプライトの位置設定
    textSprite.x = random(0 + (textSprite.x - left), WIDTH - (right - textSprite.x));
    textSprite.y = random(0 + (textSprite.y - top), HEIGHT - (bottom - textSprite.y));
    // ライン用のグラフィックスオブジェクトを作成
    let lineGraphics = new PIXI.Graphics();
    lineGraphics.alpha = 0;
    lineGraphics.lineStyle(1, 0x000000);
    lineGraphics.moveTo(0, textSprite.height * 0.5);
    lineGraphics.lineTo(textSprite.width, textSprite.height * 0.5);
    textSprite.addChild(lineGraphics);
    // 戻り値
    return textSprite;
  }

  // 範囲内でランダムな整数値を返す関数
  function random(minRange, maxRange) {
    return Math.floor(Math.random() * (maxRange - minRange + 1)) + minRange;
  }
  // 2つの矩形の当たり判定(回転を考慮)
  function checkHitRectangle(rectangle1, rectangle2) {
    // 矩形の4頂点の座標を取得
    rectangle1.points = getPointsRectangle(rectangle1);
    rectangle2.points = getPointsRectangle(rectangle2);
    // 矩形の4辺
    rectangle1.edges = [
      [rectangle1.points[0], rectangle1.points[1]],
      [rectangle1.points[1], rectangle1.points[2]],
      [rectangle1.points[2], rectangle1.points[3]],
      [rectangle1.points[3], rectangle1.points[0]]
    ];
    rectangle2.edges = [
      [rectangle2.points[0], rectangle2.points[1]],
      [rectangle2.points[1], rectangle2.points[2]],
      [rectangle2.points[2], rectangle2.points[3]],
      [rectangle2.points[3], rectangle2.points[0]]
    ];
    // 2つの矩形の辺が交差しているかをチェック
    for (let i = 0; i < 4; i++) {
      if ( checkCrossEdegs(rectangle1.edges[i], rectangle2.edges[0])
        || checkCrossEdegs(rectangle1.edges[i], rectangle2.edges[1])
        || checkCrossEdegs(rectangle1.edges[i], rectangle2.edges[2])
        || checkCrossEdegs(rectangle1.edges[i], rectangle2.edges[3]))
      {
        return true;
      }
    }
    return false;
  }
  // 矩形の4頂点の座標を取得する関数
  function getPointsRectangle(rectangle) {
    // 矩形の4頂点の座標
    let points = [
      new PIXI.Point(rectangle.x                  , rectangle.y),
      new PIXI.Point(rectangle.x                  , rectangle.y + rectangle.height),
      new PIXI.Point(rectangle.x + rectangle.width, rectangle.y + rectangle.height),
      new PIXI.Point(rectangle.x + rectangle.width, rectangle.y),
    ];
    // 矩形の回転を考慮
    points[1] = rotPoint(points[1], points[0], rectangle.rotation);
    points[2] = rotPoint(points[2], points[0], rectangle.rotation);
    points[3] = rotPoint(points[3], points[0], rectangle.rotation);
    // 戻り値
    return points;
  }
  // 点を回転する関数(回転する座標, 回転軸, 回転角度)  ※ 右回転
  function rotPoint(point, axis, angle) { 
    let dest = new PIXI.Point();
    dest.x = (point.x - axis.x) * Math.cos(angle) - (point.y - axis.y) * Math.sin(angle) + axis.x;
    dest.y = (point.x - axis.x) * Math.sin(angle) + (point.y - axis.y) * Math.cos(angle) + axis.y;
    // dest.y = -1 * dest.y;
    return dest;
  }
  // 2辺が交差しているかを判定する関数
  function checkCrossEdegs(edge1, edge2) {
    // 交差判定計算1
    let t1 = (edge2[0].y - edge1[0].y) * (edge1[1].x - edge1[0].x) - (edge2[0].x - edge1[0].x) * (edge1[1].y - edge1[0].y);
    let t2 = (edge2[1].y - edge1[0].y) * (edge1[1].x - edge1[0].x) - (edge2[1].x - edge1[0].x) * (edge1[1].y - edge1[0].y);
    // 交差判定計算2
    let t3 = (edge1[0].y - edge2[0].y) * (edge2[1].x - edge2[0].x) - (edge1[0].x - edge2[0].x) * (edge2[1].y - edge2[0].y);
    let t4 = (edge1[1].y - edge2[0].y) * (edge2[1].x - edge2[0].x) - (edge1[1].x - edge2[0].x) * (edge2[1].y - edge2[0].y);
    // t1とt2の正負が異なる場合: 「edge1の線分」と「edge2の辺」は交差する, t1やt2が「0」の場合: 「edge1の線分」と「edge2の頂点」が重なる 
    if (t1 * t2 < 0 || (t1 === 0 && !(t2 === 0)) || (!(t1 === 0) && t2 === 0)) {
      // t3とt4の正負が異なる場合: 「edge2の線分」と「edge1の辺」は交差する, t3やt4が「0」の場合: 「edge2の線分」と「edge1の頂点」が重なる 
      if (t3 * t4 < 0 || (t3 === 0 && !(t4 === 0)) || (!(t3 === 0) && t4 === 0)) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}, false);
