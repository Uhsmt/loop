import * as PIXI from 'pixi.js';
import * as Utility from './utility';
import { myConsts, ButterflySizeType } from './const';
import { Application } from 'pixi.js';

class Leaf extends PIXI.Container
{
    scoreRate = 1;
    text:string;

    constructor(_multiplicationRate:number)
    {
        super();
        this.name = 'leaf';
        this.scoreRate = _multiplicationRate;
        this.text = `x${_multiplicationRate}`;

        // const sprite = new PIXI.Sprite.from(app.loader.resources.leaf.texture); TODO texture呼び出し方
        const sprite:PIXI.Sprite = PIXI.Sprite.from('./images/leaf.png');

        sprite.scale.x = 0.1;
        sprite.scale.y = 0.1;
        sprite.anchor.set(0.5);
        this.addChild(sprite);

        const text = new PIXI.Text(this.text, {
            fontFamily: 'Arial',
            fontSize: 15,
            fill: 0xffffff
        });

        text.x = 2;
        text.anchor.set(0.5);
        this.addChild(text);
    }
}
export class Butterfly extends PIXI.Container
{
    name : string;
    size : string;
    dispColor :number;
    color :number;
    subColor :number;
    multiplicationRate :number;
    baseScale = 1;
    isFlying = false;
    isFrapping = false;
    sprite: PIXI.Sprite;
    ellipse: PIXI.Graphics;
    flapDuration = Utility.random(myConsts.FLAP_DURATION, myConsts.FLAP_DURATION * 3);
    private app: Application;
    ticker = new PIXI.Ticker();

    constructor(_size:string, _color:number, _subColor:number, _scoreMultiplication:number, app:Application)
    {
        super();
        this.app = app;
        this.name = 'butterfly';
        this.interactive = true;
        this.size = _size;
        this.dispColor = _color;
        this.color = _color;
        this.subColor = _subColor;
        this.multiplicationRate = _scoreMultiplication;
        this.sprite = this.createSprite();
        this.ellipse = this.createEllipse();
        this.ticker.start();

        this.addChild(this.sprite);
        this.addChild(this.ellipse);
        if (_scoreMultiplication >= 2)
        {
            this.addChild(new Leaf(_scoreMultiplication));
        }

        switch (this.size)
        {
            case ButterflySizeType.SMALL:
                this.scaleSet(0.10);
                break;
            case ButterflySizeType.LARGE:
                this.scaleSet(0.20);
                break;
            case ButterflySizeType.MEDIUM:
            default:
                this.scaleSet(0.15);
                break;
        }

        this.on('pointertap', this.clickEvent);
        this.flap();
    }

    private scaleSet(rate:number)
    {
        this.baseScale = rate;
        const sprite = this.getChildByName('sprite');

        sprite.scale.x = rate;
        sprite.scale.y = rate;

        const ellipse = this.getChildByName('ellipse');

        if (ellipse !== undefined)
        {
            ellipse.scale.x = rate;
            ellipse.scale.y = rate;
        }

        const leaf = this.getChildByName('leaf');

        if (leaf !== undefined && leaf !== null)
        {
            leaf.x = 0;
            leaf.y = 0;
            leaf.y = (myConsts.BUTTERFLY_HEIGHT * 0.5 * rate) + (1 / rate);
        }
    }

    private clickEvent()
    {
    // TODO テスト用。完了後は消す
        // console.log(this);
    }

    private createSprite()
    {
        let sprite:PIXI.Sprite;

        switch (this.size)
        {
            case ButterflySizeType.SMALL:
                sprite = new PIXI.Sprite(this.app.loader.resources.butterfly_small.texture);
                break;
            case ButterflySizeType.LARGE:
            case ButterflySizeType.MEDIUM:
            default:
                sprite = new PIXI.Sprite(this.app.loader.resources.butterfly_large.texture);
                break;
        }

        sprite.tint = this.color;
        sprite.name = 'sprite';
        sprite.anchor.set(0.5);

        return sprite;
    }

    private createEllipse()
    {
        const ellipse = new PIXI.Graphics();

        this.drawEllipse(ellipse, this.subColor);
        ellipse.x = 0;
        ellipse.y = 0;
        ellipse.name = 'ellipse';

        return ellipse;
    }

    private drawEllipse(_obj:PIXI.Graphics, _color:number)
    {
        _obj.clear();
        _obj.beginFill(_color)
            .drawEllipse(0, 0, 30, 40)
            .endFill();
    }

    show()
    {
        let x = Utility.random(1, this.app.screen.width);
        let y = Utility.random(1, this.app.screen.height);

        const left = x;
        const right = this.app.screen.width - left;
        const top = y;
        const bottom = this.app.screen.height - top;
        const min = Math.min(left, right, top, bottom);

        if (min === left)
        {
            x = 0;
        }
        else if (min === right)
        {
            x = this.app.screen.width;
        }
        else if (min === top)
        {
            y = 0;
        }
        else if (min === bottom)
        {
            y = this.app.screen.height;
        }

        this.x = x;
        this.y = y;
    }

    // TODO Ropeがあったらそれを踏まないように方向転換させたいな
    fly(ROPE_CONTAINER:PIXI.Container)
    {
        this.isFlying = true;
        let xDiretion:number;
        let yDiretion:number;

        switch (this.size)
        {
            case ButterflySizeType.SMALL:
                xDiretion = 1;
                yDiretion = 0.8;
                break;
            case ButterflySizeType.LARGE:
                xDiretion = 0.6;
                yDiretion = 0.4;
                break;
            case ButterflySizeType.MEDIUM:
            default:
                xDiretion = 0.8;
                yDiretion = 0.6;
                break;
        }
        const xTernFrame = Utility.random(120, 150);
        let xFrame = Utility.random(1, 120);

        const yTernFrame = Utility.random(120, 150);
        let yFrame = Utility.random(1, 120);

        this.ticker.add(() =>
        {
            if (!this.isFlying)
            {
                return;
            }
            if (xDiretion < 0 && this.x <= 0)
            {
                xFrame = 0;
                xDiretion = Math.abs(xDiretion);
            }
            else if (xDiretion > 0 && this.x >= this.app.screen.width)
            {
                xFrame = 0;
                xDiretion = -1 * Math.abs(xDiretion);
            }
            else if (xFrame === xTernFrame)
            {
                xFrame = 0;
                xDiretion *= Utility.chooseAtRandom([-1, 1], 1)[0];
            }
            else
            {
                xFrame += 1;
            }

            if (yDiretion < 0 && this.y <= 0)
            {
                yFrame = 0;
                yDiretion = Math.abs(yDiretion);
            }
            else if (yDiretion > 0 && this.y >= this.app.screen.height)
            {
                yFrame = 0;
                yDiretion = -1 * Math.abs(yDiretion);
            }
            else if (yFrame === yTernFrame)
            {
                yFrame = 0;
                yDiretion *= Utility.chooseAtRandom([-1, 1], 1)[0];
            }
            else
            {
                yFrame += 1;
            }

            this.x += xDiretion;
            this.y += yDiretion;
        });
    }

    stop()
    {
        this.isFlying = false;
        this.isFrapping = false;
    }

    restartFly()
    {
        this.isFlying = true;
    }

    flap()
    {
        this.isFrapping = false;

        // flapping trigger
        let frameCount = 0;

        frameCount += Utility.random(0, this.flapDuration);
        this.ticker.add(() =>
        {
            if (frameCount === this.flapDuration)
            {
                this.isFrapping = true;
                const halfDuration = myConsts.FLAP_DURATION / 2;

                frameCount -= (myConsts.FLAP_DURATION + Utility.random(halfDuration, halfDuration));
            }
            else
            {
                frameCount += 1;
            }
        });

        // flapping animation
        let flappingProgress = 0;
        const flappingSpeed = 0.01;

        this.ticker.add(() =>
        {
            if (!this.isFrapping)
            {
                return;
            }
            if (flappingProgress === 100)
            {
                flappingProgress = 0;
                this.isFrapping = false;

                return;
            }
            let diff = 0;

            if (flappingProgress < 50)
            {
                diff = flappingProgress * (flappingSpeed * -1);
            }
            else
            {
                diff = (100 - flappingProgress) * (flappingSpeed * -1);
            }
            this.getChildByName('sprite').scale.x = (1 + diff) * this.baseScale;
            this.getChildByName('ellipse').scale.x = (1 + diff) * this.baseScale;
            flappingProgress += 2;
        });
    }

    switchColor()
    {
        if (this.color === this.dispColor)
        {
            this.dispColor = this.subColor;
            this.sprite.tint = this.subColor;
            this.drawEllipse(this.ellipse, this.color);
        }
        else
        {
            this.dispColor = this.color;
            this.sprite.tint = this.color;
            this.drawEllipse(this.ellipse, this.subColor);
        }
    }

    delete()
    {
        this.isFrapping = false;
        this.stop();
        let frame = 0;

        this.ticker.add(() =>
        {
            frame += 1;
            if (frame <= 10)
            {
                return;
            }
            this.alpha -= 0.03;
            if (this.alpha <= 0.1)
            {
                this.ticker.destroy();
                this.destroy();
            }
        });
    }
}
