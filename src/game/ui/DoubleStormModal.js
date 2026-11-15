/**
 * Double Storm Decision Modal UI
 *
 * Futuristic sci-fi decision dialog rendered on the 1:1 screen-space UI camera.
 * Features:
 * - Title: THE DOUBLE STORM
 * - Category Indicator: POWER + RADIATION + HEALTH + TIME
 * - Narrative introduction & structured "What happens" points
 * - 3 separate interactive decision cards (Option A, Option B, Option C)
 * - Minimize toggle button to prevent permanently obscuring gameplay
 * - Fixed screen positioning, immune to camera zoom and world scrolling
 */

import Phaser from 'phaser';
import {
  doubleStormManager,
  chooseDoubleStormOption,
  STORM_STATUS,
} from '../events/doubleStormState.js';

export class DoubleStormModal extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene, 0, 0);
    this.sceneRef = scene;
    this.setScrollFactor(0);
    this.setDepth(2000);

    this.isOpen = false;
    this.cardContainers = [];

    this.buildUI();
    this.subscribeToState();

    scene.add.existing(this);
    this.setVisible(false);

    // Responsive resize listener
    this.onResize = (gameSize) => this.reposition(gameSize.width, gameSize.height);
    scene.scale.on('resize', this.onResize, this);
  }

  subscribeToState() {
    this.unsubscribe = doubleStormManager.subscribe((state) => {
      if (state.modalVisible && state.status === STORM_STATUS.DECISION_PENDING) {
        this.open();
      } else {
        this.close();
      }
    });

    // Initial check
    const current = doubleStormManager.getState();
    if (current.modalVisible && current.status === STORM_STATUS.DECISION_PENDING) {
      this.open();
    }
  }

  buildUI() {
    const width = this.sceneRef.scale.width;
    const height = this.sceneRef.scale.height;

    // Dark semi-transparent backdrop covering center screen
    this.overlayDim = this.sceneRef.add.rectangle(0, 0, width, height, 0x000000, 0.65)
      .setOrigin(0)
      .setInteractive(); // Blocks clicks through to game world

    // Main modal frame
    this.modalBox = this.sceneRef.add.graphics();

    // Title & Category
    this.categoryText = this.sceneRef.add.text(0, 0, 'POWER + RADIATION + HEALTH + TIME', {
      fontFamily: 'Segoe UI, Trebuchet MS, sans-serif',
      fontSize: '11px',
      color: '#ff8c3b',
      fontStyle: 'bold',
      letterSpacing: 2,
    });

    this.titleText = this.sceneRef.add.text(0, 0, 'THE DOUBLE STORM', {
      fontFamily: 'Segoe UI, Trebuchet MS, sans-serif',
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
      letterSpacing: 1.5,
    });

    // Intro paragraph
    const introStr =
      'A global dust storm has covered the area. Solar energy production is falling while a solar energetic particle event is increasing radiation exposure.\n\nA replacement power component is stored outside the Outpost. The crew must decide how to retrieve it before the remaining power reserves become insufficient.';

    this.introText = this.sceneRef.add.text(0, 0, introStr, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '12px',
      color: '#c2d4e5',
      lineSpacing: 4,
    });

    // "What happens" header & bullets
    this.whatHappensHeader = this.sceneRef.add.text(0, 0, 'WHAT HAPPENS:', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '11px',
      color: '#49c2e8',
      fontStyle: 'bold',
      letterSpacing: 1,
    });

    const bulletsStr =
      '• A global dust storm covers the area.\n' +
      '• Solar panels receive significantly less sunlight.\n' +
      '• Battery reserves begin draining.\n' +
      '• A solar energetic particle event increases radiation exposure.\n' +
      '• The Outpost needs a replacement power component stored outside.';

    this.bulletText = this.sceneRef.add.text(0, 0, bulletsStr, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '11px',
      color: '#9db4c8',
      lineSpacing: 3,
    });

    // Minimize button
    this.minimizeBtn = this.sceneRef.add.text(0, 0, '[ CLOSE / MINIMIZE ]', {
      fontFamily: 'Segoe UI, monospace',
      fontSize: '11px',
      color: '#ff9d5c',
      backgroundColor: '#1b120c',
      padding: { x: 8, y: 4 },
    })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => doubleStormManager.setModalVisible(false))
      .on('pointerover', () => this.minimizeBtn.setColor('#ffffff'))
      .on('pointerout', () => this.minimizeBtn.setColor('#ff9d5c'));

    // Decision Cards data
    this.cardConfigs = [
      {
        id: 'wait',
        optionLabel: 'OPTION A',
        title: 'WAIT FOR CONDITIONS TO IMPROVE',
        desc: 'Avoid unnecessary radiation exposure and wait inside until surface conditions improve.',
        tradeoffs: '• Radiation exposure avoided\n• Battery drains steadily\n• Risk of critical habitat loss',
        btnText: 'SELECT PROTOCOL A',
        accentColor: 0x4aa3df,
        accentHex: '#4aa3df',
      },
      {
        id: 'immediate',
        optionLabel: 'OPTION B',
        title: 'SEND ASTRONAUT OUTSIDE NOW',
        desc: 'Attempt to retrieve the replacement power component immediately despite active hazards.',
        tradeoffs: '• Power can recover sooner\n• Extreme radiation exposure\n• Suit battery consumed',
        btnText: 'SELECT PROTOCOL B',
        accentColor: 0xe05338,
        accentHex: '#e05338',
      },
      {
        id: 'shielded',
        optionLabel: 'OPTION C',
        title: 'USE SHIELDED EXPLORATION SUIT',
        desc: 'Prepare additional radiation shielding before sending the astronaut outside.',
        tradeoffs: '• 65% radiation reduction\n• Prep takes 25s & 12% power\n• Component retrieval needed',
        btnText: 'SELECT PROTOCOL C',
        accentColor: 0x36c78b,
        accentHex: '#36c78b',
      },
    ];

    this.add([
      this.overlayDim,
      this.modalBox,
      this.categoryText,
      this.titleText,
      this.introText,
      this.whatHappensHeader,
      this.bulletText,
      this.minimizeBtn,
    ]);

    this.buildCards();
    this.reposition(width, height);
  }

  buildCards() {
    this.cardConfigs.forEach((cfg) => {
      const container = this.sceneRef.add.container(0, 0);
      const bg = this.sceneRef.add.graphics();

      const optLabel = this.sceneRef.add.text(12, 10, cfg.optionLabel, {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '10px',
        color: cfg.accentHex,
        fontStyle: 'bold',
        letterSpacing: 1,
      });

      const title = this.sceneRef.add.text(12, 26, cfg.title, {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '12px',
        color: '#ffffff',
        fontStyle: 'bold',
      });

      const desc = this.sceneRef.add.text(12, 60, cfg.desc, {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '10px',
        color: '#b0c5d8',
        lineSpacing: 2,
      });

      const tradeoffs = this.sceneRef.add.text(12, 105, cfg.tradeoffs, {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '9.5px',
        color: '#8da5ba',
        lineSpacing: 2,
      });

      const btn = this.sceneRef.add.text(12, 160, `[ ${cfg.btnText} ]`, {
        fontFamily: 'Segoe UI, monospace',
        fontSize: '11px',
        color: '#ffffff',
        backgroundColor: '#162232',
        padding: { x: 10, y: 6 },
      })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          chooseDoubleStormOption(cfg.id);
        })
        .on('pointerover', () => {
          btn.setBackgroundColor('#284566');
          bg.clear();
          this.drawCardBg(bg, container.cardW, container.cardH, cfg.accentColor, 0.95, true);
        })
        .on('pointerout', () => {
          btn.setBackgroundColor('#162232');
          bg.clear();
          this.drawCardBg(bg, container.cardW, container.cardH, cfg.accentColor, 0.85, false);
        });

      container.add([bg, optLabel, title, desc, tradeoffs, btn]);
      container.cardBg = bg;
      container.cfg = cfg;
      container.descText = desc;
      container.titleText = title;
      container.btn = btn;

      this.add(container);
      this.cardContainers.push(container);
    });
  }

  drawCardBg(graphics, w, h, accentColor, alpha = 0.85, isHover = false) {
    graphics.fillStyle(0x0c131d, alpha);
    graphics.fillRoundedRect(0, 0, w, h, 6);
    graphics.lineStyle(isHover ? 2 : 1, accentColor, isHover ? 1 : 0.45);
    graphics.strokeRoundedRect(0, 0, w, h, 6);
  }

  reposition(screenWidth, screenHeight) {
    this.overlayDim.setSize(screenWidth, screenHeight);

    // Modal size: responsive bounds
    const modalW = Math.min(840, screenWidth * 0.90);
    const modalH = Math.min(540, screenHeight * 0.88);
    const modalX = (screenWidth - modalW) / 2;
    const modalY = (screenHeight - modalH) / 2;

    this.modalBox.clear();
    // Base container fill
    this.modalBox.fillStyle(0x070c14, 0.94);
    this.modalBox.fillRoundedRect(modalX, modalY, modalW, modalH, 8);
    // Outer glow border
    this.modalBox.lineStyle(2, 0x27435f, 0.9);
    this.modalBox.strokeRoundedRect(modalX, modalY, modalW, modalH, 8);
    // Header divider line
    this.modalBox.lineStyle(1, 0x1d364d, 0.7);
    this.modalBox.lineBetween(modalX + 24, modalY + 68, modalX + modalW - 24, modalY + 68);

    // Position Header
    this.categoryText.setPosition(modalX + 24, modalY + 16);
    this.titleText.setPosition(modalX + 24, modalY + 32);
    this.minimizeBtn.setPosition(modalX + modalW - 160, modalY + 22);

    // Position Intro and Bullets
    const contentW = modalW - 48;
    this.introText.setPosition(modalX + 24, modalY + 80);
    this.introText.setWordWrapWidth(contentW * 0.58);

    this.whatHappensHeader.setPosition(modalX + contentW * 0.62 + 24, modalY + 80);
    this.bulletText.setPosition(modalX + contentW * 0.62 + 24, modalY + 98);
    this.bulletText.setWordWrapWidth(contentW * 0.38);

    // Position Decision Cards
    const cardGap = 16;
    const cardTop = modalY + 230;
    const totalGap = cardGap * 2;
    const cardW = (contentW - totalGap) / 3;
    const cardH = modalH - 250;

    this.cardContainers.forEach((container, idx) => {
      const cx = modalX + 24 + idx * (cardW + cardGap);
      container.setPosition(cx, cardTop);
      container.cardW = cardW;
      container.cardH = cardH;

      container.cardBg.clear();
      this.drawCardBg(container.cardBg, cardW, cardH, container.cfg.accentColor, 0.85, false);

      container.descText.setWordWrapWidth(cardW - 24);
      container.titleText.setWordWrapWidth(cardW - 24);
      container.btn.setPosition(12, cardH - 36);
    });
  }

  open() {
    this.isOpen = true;
    this.setVisible(true);
  }

  close() {
    this.isOpen = false;
    this.setVisible(false);
  }

  destroy(fromScene) {
    if (this.sceneRef?.scale) {
      this.sceneRef.scale.off('resize', this.onResize, this);
    }
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    super.destroy(fromScene);
  }
}
