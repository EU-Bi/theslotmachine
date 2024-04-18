import * as PIXI from "./pixi.mjs";

(async () => {
  const size = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  // Create the application
  const app = new PIXI.Application();
  await app.init({
    backgroundColor: "1099bb",
    width: size.width * 0.98,
    height: size.height * 0.98,
  });

  document.body.appendChild(app.canvas);

  await PIXI.Assets.load([
    "../assets/M00_000.jpg",
    "../assets/M01_000.jpg",
    "../assets/M02_000.jpg",
    "../assets/M03_000.jpg",
    "../assets/M04_000.jpg",
    "../assets/M05_000.jpg",
    "../assets/M06_000.jpg",
    "../assets/M07_000.jpg",
    "../assets/M08_000.jpg",
    "../assets/M09_000.jpg",
    "../assets/M10_000.jpg",
    "../assets/M11_000.jpg",
    "../assets/M12_000.jpg",
  ]);
  const SYMBOL_SIZE = size.height / 4;
  const REEL_WIDTH = size.width / 5.3;

  const slotTextures = [
    PIXI.Texture.from("../assets/M01_000.jpg"),
    PIXI.Texture.from("../assets/M02_000.jpg"),
    PIXI.Texture.from("../assets/M03_000.jpg"),
    PIXI.Texture.from("../assets/M04_000.jpg"),
    PIXI.Texture.from("../assets/M05_000.jpg"),
    PIXI.Texture.from("../assets/M06_000.jpg"),
    PIXI.Texture.from("../assets/M07_000.jpg"),
    PIXI.Texture.from("../assets/M08_000.jpg"),
    PIXI.Texture.from("../assets/M09_000.jpg"),
    PIXI.Texture.from("../assets/M10_000.jpg"),
    PIXI.Texture.from("../assets/M11_000.jpg"),
    PIXI.Texture.from("../assets/M12_000.jpg"),
    PIXI.Texture.from("../assets/M00_000.jpg"),
  ];

  const reels = [];
  const reelContainer = new PIXI.Container();

  for (let i = 0; i < 5; i++) {
    const rc = new PIXI.Container();
    rc.x = i * REEL_WIDTH;
    reelContainer.addChild(rc);
    const reel = {
      container: rc,
      symbols: [],
      position: 0,
      previousPosition: 0,
      blur: new PIXI.BlurFilter(),
    };
    reel.blur.blurX = reel.blur.blurY = 0;
    rc.filters = [reel.blur];
    for (let j = 0; j < slotTextures.length; j++) {
      const symbol = new PIXI.Sprite(
        slotTextures[Math.floor(Math.random() * slotTextures.length)]
      );
      symbol.y = j * SYMBOL_SIZE;
      symbol.scale.x = symbol.scale.y = Math.min(
        SYMBOL_SIZE / symbol.width,
        SYMBOL_SIZE / symbol.height
      );
      symbol.x = Math.round((SYMBOL_SIZE - symbol.width) / 2);
      reel.symbols.push(symbol);
      rc.addChild(symbol);
    }
    reels.push(reel);
  }
  app.stage.addChild(reelContainer)

  const margin = (app.screen.height - SYMBOL_SIZE * 3) / 2;

    reelContainer.y = margin;
    reelContainer.x = Math.round(app.screen.width - REEL_WIDTH * 5);
    const top = new PIXI.Graphics().rect(0, 0, app.screen.width, margin).fill({ color: 0x0 });
    const bottom = new PIXI.Graphics().rect(0, SYMBOL_SIZE * 3 + margin, app.screen.width, margin).fill({ color: 0x0 });
    
    const fill = new PIXI.FillGradient(0, 0, 0, 36 * 1.7);

    const colors = [0xffffff, 0x004cff].map((color) => PIXI.Color.shared.setValue(color).toNumber());

    colors.forEach((number, index) =>
    {
        const ratio = index / colors.length;

        fill.addColorStop(ratio, number);
    });

    const style = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 36,
        fontStyle: 'italic',
        fontWeight: 'bold',
        fill: { fill },
        stroke: { color: 0x2a3242, width: 5 },
        dropShadow: {
            color: 0x000000,
            angle: Math.PI / 6,
            blur: 4,
            distance: 6,
        },
        wordWrap: true,
        wordWrapWidth: 440,
    });

    const playText = new PIXI.Text('Spin!', style);

    playText.x = Math.round((bottom.width - playText.width) / 2);
    playText.y = app.screen.height - margin + Math.round((margin - playText.height) / 2);
    bottom.addChild(playText);

    const headerText = new PIXI.Text('The Slot Machine', style);

    headerText.x = Math.round((top.width - headerText.width) / 2);
    headerText.y = Math.round((margin - headerText.height) / 2);
    top.addChild(headerText);

    app.stage.addChild(top)
    app.stage.addChild(bottom);

    bottom.eventMode = 'static';
    bottom.cursor = 'pointer';
    bottom.addListener('pointerdown', () =>
    {
        startPlay();
    });

    let running = false;
    function startPlay()
    {
        if (running) return;
        running = true;

        for (let i = 0; i < reels.length; i++)
        {
            const r = reels[i];
            const extra = Math.floor(Math.random() * 3);
            const target = r.position + 10 + i * 5;
            const time = 2500 + i * 600 + extra * 600;

            tweenTo(r, 'position', target, time, backout(0), null, i === reels.length - 1 ? reelsComplete : null);
        }
    }

    // Reels done handler.
    function reelsComplete()
    {
        running = false;
    }

    app.ticker.add(() =>
    {
        // Update the slots.
        for (let i = 0; i < reels.length; i++)
        {
            const r = reels[i];
            // Update blur filter y amount based on speed.
            // This would be better if calculated with time in mind also. Now blur depends on frame rate.

            r.blur.blurY = (r.position - r.previousPosition) * 8;
            r.previousPosition = r.position;

            // Update symbol positions on reel.
            for (let j = 0; j < r.symbols.length; j++)
            {
                const s = r.symbols[j];
                const prevy = s.y;

                s.y = ((r.position + j) % r.symbols.length) * SYMBOL_SIZE - SYMBOL_SIZE;
                if (s.y < 0 && prevy > SYMBOL_SIZE)
                {
                    // Detect going over and swap a texture.
                    // This should in proper product be determined from some logical reel.
                    s.texture = slotTextures[Math.floor(Math.random() * slotTextures.length)];
                    s.scale.x = s.scale.y = Math.min(SYMBOL_SIZE / s.texture.width, SYMBOL_SIZE / s.texture.height);
                    s.x = Math.round((SYMBOL_SIZE - s.width) / 2);
                }
            }
        }
    });

    const tweening = [];

    function tweenTo(object, property, target, time, easing, onchange, oncomplete)
    {
        const tween = {
            object,
            property,
            propertyBeginValue: object[property],
            target,
            easing,
            time,
            change: onchange,
            complete: oncomplete,
            start: Date.now(),
        };

        tweening.push(tween);

        return tween;
    }

    app.ticker.add(() =>
    {
        const now = Date.now();
        const remove = [];

        for (let i = 0; i < tweening.length; i++)
        {
            const t = tweening[i];
            const phase = Math.min(1, (now - t.start) / t.time);

            t.object[t.property] = lerp(t.propertyBeginValue, t.target, t.easing(phase));
            if (t.change) t.change(t);
            if (phase === 1)
            {
                t.object[t.property] = t.target;
                if (t.complete) t.complete(t);
                remove.push(t);
            }
        }
        for (let i = 0; i < remove.length; i++)
        {
            tweening.splice(tweening.indexOf(remove[i]), 1);
        }
    });

    // Basic lerp funtion.
    function lerp(a1, a2, t)
    {
        return a1 * (1 - t) + a2 * t;
    }

    function backout(amount)
    {
        return (t) => --t * t * ((amount + 1) * t + amount) + 1;
    }

})();
