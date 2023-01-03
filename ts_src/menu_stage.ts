import * as PIXI from 'pixi.js';
import { Stage } from './stage';
import { LoopArea } from './rope';
import { Butterfly } from './butterfly';
import { myConsts, ButterflySizeType } from './const';
import { GameStage } from './game_stage';
import { Message } from './message';

class MenuButton extends PIXI.Container
{
    selectedFunction:()=>void;
    app:PIXI.Application;
    label:string;

    constructor(text:string, app:PIXI.Application, func:()=>void)
    {
        super();
        this.app = app;
        this.label = text;
        const color = myConsts.COLOR_LIST[1];
        const butterfly = new Butterfly(ButterflySizeType.MEDIUM, color, color, 1, app);
        const textObj = new PIXI.Text(text, {
            fontFamily: 'Amatic SC',
            fontSize: 50,
            fontWeight: 'bold',
            fill: ['#432c39'],
            lineJoin: 'round',
            align: 'center',
        });

        textObj.x = 25;
        textObj.anchor.y = 0.5;
        this.addChild(textObj);
        this.addChild(butterfly);

        this.selectedFunction = func;
        this.interactive = true;
        this.on('pointertap', () =>
        {
            console.log(this.getBounds());
            const msg = new Message('Don\'t click. Please loop!', 20);

            msg.x = (app.screen.width / 2);
            msg.y = app.screen.height / 2;
            app.stage.addChild(msg);
            msg.show(true, 50);
        });
        this.visible = false;
    }
    show()
    {
        this.visible = true;
    }
    selected()
    {
        if (!this.visible)
        {
            console.warn('not visible button.');

            return;
        }
        this.selectedFunction();
    }
    isHit(loopArea:LoopArea):boolean
    {
        let res = false;

        for (const point of this.getPoints())
        {
            const hit = this.app.renderer.plugins.interaction.hitTest(point, loopArea);

            if (hit && hit.name === 'loopObj')
            {
                res = true;
                break;
            }
        }

        return res;
    }
    private getPoints():PIXI.Point[]
    {
        const arr: Array<PIXI.Point> = [];
        const xStart = Math.round(this.getBounds().x);
        const xEnd = Math.round(xStart + this.getBounds().width);
        const yStart = Math.round(this.getBounds().y);
        const yEnd =  Math.round(yStart + this.getBounds().height);

        for (let x = xStart; x <= xEnd; x++)
        {
            for (let y = yStart; y <= yEnd; y++)
            {
                arr.push(new PIXI.Point(x, y));
            }
        }

        return arr;
    }
}

export class MenuStage extends Stage
{
    constructor(app:PIXI.Application, stage1:GameStage)
    {
        super(app);
        this.setBackGround();
        const title = new PIXI.Text('LOOP', {
            fontFamily: 'Amatic SC',
            fontSize: 100,
            fill: ['#fcc5e4', '#fda34b', '#ff7882', '#c8699e', '#7046aa', '#0c1db8', '#020f75'],
            align: 'center',
        });

        title.x = this.app.screen.width / 2;
        title.y = this.app.screen.height / 5;
        title.anchor.set(0.5);

        this.BACKGROUND_CONTAINER.addChild(title);
        const startButton = new MenuButton('start', this.app, async () =>
        {
            // TODO MENUstageのdestroy
            this.BACKGROUND_CONTAINER.removeChildren();
            this.GAME_CONTAINER.removeChildren();
            stage1.initialize();
            stage1.start().then((res) =>
            {
                stage1.dispResult(res);
                console.log(`stage1.done:result=${res}`);
            });
        });

        startButton.x = (app.screen.width / 3) - (startButton.getBounds().width / 2);
        startButton.y = app.screen.height * 2 / 5;
        this.GAME_CONTAINER.addChild(startButton);

        const helpButton = new MenuButton('help', this.app, () =>
        {
            // TODO help
            console.log('help');
            const msg = new Message('sorry,in preparation', 20);

            msg.x = (app.screen.width / 2);
            msg.y = app.screen.height / 2;
            app.stage.addChild(msg);
            msg.show(true, 50);
        });

        helpButton.x = (app.screen.width * 2 / 3) - (helpButton.getBounds().width / 2);
        helpButton.y = app.screen.height * 2 / 5;
        this.GAME_CONTAINER.addChild(helpButton);

        // TODO button and setBackGroundのasync化
        startButton.show();
        helpButton.show();
    }
    initialize(): void
    {
        super.initialize();
        this.setRope(50);
    }
    private setBackGround()
    {
        const leaf1 = new PIXI.Sprite(this.app.loader.resources.leaf1.texture);

        leaf1.scale.set(0.7);
        leaf1.anchor.y = 1;
        leaf1.y = this.app.screen.height * 1.25;

        const leaf2 = new PIXI.Sprite(this.app.loader.resources.leaf2.texture);

        leaf2.scale.set(0.7);
        leaf2.x = 100;
        leaf2.anchor.y = 1;
        leaf2.y = this.app.screen.height * 1.25;
        const leaf3 = new PIXI.Sprite(this.app.loader.resources.leaf3.texture);

        leaf3.scale.set(0.7);
        leaf3.x = 200;
        leaf3.anchor.y = 1;
        leaf3.y = this.app.screen.height * 1.25;
        const leaf4 = new PIXI.Sprite(this.app.loader.resources.leaf4.texture);

        leaf4.x = 300;
        leaf4.anchor.y = 1;
        leaf4.y = this.app.screen.height * 1.25;
        const leaf5 = new PIXI.Sprite(this.app.loader.resources.leaf5.texture);

        leaf5.x = 400;
        leaf5.anchor.y = 1;
        leaf5.y = this.app.screen.height * 1.25;
        const leaf6 = new PIXI.Sprite(this.app.loader.resources.leaf6.texture);

        leaf6.x = 500;
        leaf6.anchor.y = 1;
        leaf6.y = this.app.screen.height * 1.25;

        this.BACKGROUND_CONTAINER.addChild(leaf1);
        this.BACKGROUND_CONTAINER.addChild(leaf2);
        this.BACKGROUND_CONTAINER.addChild(leaf3);
        this.BACKGROUND_CONTAINER.addChild(leaf4);
        this.BACKGROUND_CONTAINER.addChild(leaf5);
        this.BACKGROUND_CONTAINER.addChild(leaf6);
    }

    protected loop(points: number[]): void
    {
        this.deleteRoop();
        const loopArea = new LoopArea(points);

        const buttons = this.GAME_CONTAINER.children;
        const loopedButtons: Array<MenuButton> = [];

        for (const button of buttons)
        {
            if (!(button instanceof MenuButton))
            {
                continue;
            }
            if (button.isHit(loopArea))
            {
                loopedButtons.push(button);
            }
        }
        if (loopedButtons.length === 1)
        {
            loopedButtons[0].selected();
        }
        this.GAME_CONTAINER.addChild(loopArea);
        loopArea.delete();
    }
}

