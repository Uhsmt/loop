import * as PIXI from 'pixi.js';
import { WebfontLoaderPlugin } from 'pixi-webfont-loader';
import { GameStage } from './game_stage';
import { ButterflySizeType } from './const';
import { Message } from './message';
import { MenuStage } from './menu_stage';

PIXI.Loader.registerPlugin(WebfontLoaderPlugin);

const app = new PIXI.Application({
    width: 700,
    height: 500,
    backgroundColor: 0xffffff,
    antialias: true
});

const stage1 = new GameStage({
    level: 1,
    butterflyNum: 8,
    colorNum: 2,
    sizeType: ButterflySizeType.LARGE,
    clearCondition: 10,
    app,
});

window.addEventListener('load', () =>
{
    // app set
    const element: HTMLElement = <HTMLElement>document.getElementById('app');

    element.appendChild(app.view);

    // ready loading object
    const loading = new PIXI.Graphics();

    loading.lineStyle(2, 0xbbbbbb, 1);
    loading.drawRect((app.screen.width - 100) / 2, (app.screen.height - 20) / 2, 100, 20);
    loading.endFill();
    app.stage.addChild(loading);

    const loadingMessage = new Message('loading', 20);

    loadingMessage.x = app.screen.width / 2;
    loadingMessage.y = (app.screen.height / 2) + 60;
    loading.addChild(loadingMessage);
    loadingMessage.show(false, 30);

    app.loader.add([
        { url: 'https://fonts.googleapis.com/css2?family=Amatic+SC&family=Yomogi&family=Marvel&family=Neucha&display=display=swap' },
        { name: 'butterfly_large', url: './images/butterfly_large.png' },
        { name: 'butterfly_medium', url: './images/butterfly_medium.png' },
        { name: 'butterfly_small', url: './images/butterfly_small.png' },
        { name: 'leaf', url: './images/leaf.png' },
        { name: 'background', url: './images/background.jpg' },
        { name: 'pencil', url: './images/pencil.png' },
        { name: 'sun', url: './images/sun.png' },
        { name: 'sunset_spritesheet', url: './images/sunset.json' },
        { name: 'bear', url: './images/bear.png' },
        { name: 'base', url: './images/base.png' },
        { name: 'leaf1', url: './images/leaf1.png' },
        { name: 'leaf2', url: './images/leaf2.png' },
        { name: 'leaf3', url: './images/leaf3.png' },
        { name: 'leaf4', url: './images/leaf4.png' },
        { name: 'leaf5', url: './images/leaf5.png' },
        { name: 'leaf6', url: './images/leaf6.png' },
        { name: 'leaf7', url: './images/leaf7.png' },
        { name: 'sticky', url: './images/sticky.png' }
    ]).load(() =>
    {
        PIXI.TextMetrics.BASELINE_SYMBOL += 'あ｜';
        loading.destroy();
        // set base
        const backgroundSprite = new PIXI.Sprite(app.loader.resources.base.texture);
        const BASE_CONTAINER = new PIXI.Container();

        backgroundSprite.interactive = true;
        backgroundSprite.anchor.y = 1;
        backgroundSprite.x = 0;
        backgroundSprite.y = app.screen.height;
        app.stage.addChild(BASE_CONTAINER);
        BASE_CONTAINER.addChild(backgroundSprite);

        new MenuStage(app, stage1).initialize();
    });

    app.loader.onProgress.add(() =>
    {
        loading.beginFill(0x00B7FF);
        loading.drawRect((app.screen.width - 100) / 2, (app.screen.height - 20) / 2, app.loader.progress, 20);
        loading.endFill();
    });

    // test
    document.getElementById('gameStart')?.addEventListener('click', gameStart);
    document.getElementById('gameTest')?.addEventListener('click', gameTest);
    document.getElementById('stopAnimation')?.addEventListener('click', stopAnimation);
    document.getElementById('startAnimation')?.addEventListener('click', startAnimation);
    document.getElementById('drawingStop')?.addEventListener('click', drawingStop);
    document.getElementById('consoleTest')?.addEventListener('click', consoleTest);
});

function consoleTest()
{
    console.log('consoletest');
    stage1.testConsole();
}

function gameStart()
{
    stage1.start();
}

function gameTest()
{
    stage1.gameTest();
}

function startAnimation()
{
    stage1.startAnimation();
}

function stopAnimation()
{
    stage1.stopAnimation();
}

function drawingStop()
{
    stage1.drawingStop();
}
