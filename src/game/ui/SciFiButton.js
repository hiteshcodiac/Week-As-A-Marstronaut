import Phaser from 'phaser';

/**
 * SciFiButton
 * A reusable, futuristic sci-fi interactive button component for Phaser scenes.
 * Features:
 * - Subtle glassmorphic backdrop
 * - Tech corner accents / brackets
 * - Ambient pulse glow
 * - Perfectly centered hit area
 * - Smooth hover, click, and transition feedback
 */
export class SciFiButton extends Phaser.GameObjects.Container {
  constructor(scene, x, y, text, options = {}) {
    super(scene, x, y);

    const {
      accentColor = 0xff7b39,
      glowColor = 0xff5500,
      bgColor = 0x070b12,
      bgAlpha = 0.65,
      textColor = '#ffffff',
      fontSize = '14px',
      paddingX = 26,
      paddingY = 12,
      onClick = () => {},
    } = options;

    this.accentColor = accentColor;
    this.glowColor = glowColor;
    this.bgColor = bgColor;
    this.bgAlpha = bgAlpha;
    this.onClick = onClick;
    this.isTransitioning = false;

    // 1. Text Label
    this.label = scene.add.text(0, 0, text, {
      fontFamily: "'Rajdhani', 'Orbitron', 'Segoe UI', system-ui, sans-serif",
      fontSize: fontSize,
      fontStyle: '700',
      color: textColor,
      align: 'center',
    });
    this.label.setOrigin(0.5, 0.5);

    // Calculate dimensions based on text length
    const bounds = this.label.getBounds();
    const width = Math.max(170, bounds.width + paddingX * 2);
    const height = Math.max(42, bounds.height + paddingY * 2);
    this.btnWidth = width;
    this.btnHeight = height;

    // 2. Ambient Soft Glow
    this.glow = scene.add.graphics();
    this.drawGlow(0.35);

    // 3. Semi-transparent Backdrop
    this.bg = scene.add.graphics();
    this.drawBg();

    // 4. Futuristic Tech Border & Corner Brackets
    this.border = scene.add.graphics();
    this.drawBorder(0.65, 1);

    // Add children in rendering order
    this.add([this.glow, this.bg, this.border, this.label]);

    // Setup interactive zone with centered geometry matching Phaser Container displayOrigin
    this.setSize(width, height);
    this.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(0, 0, width, height),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });

    // Idle ambient glow pulse (very subtle, non-distracting)
    this.idleTween = scene.tweens.add({
      targets: this.glow,
      alpha: { from: 0.25, to: 0.5 },
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Pointer event bindings
    this.on('pointerover', this.onPointerOver, this);
    this.on('pointerout', this.onPointerOut, this);
    this.on('pointerdown', this.onPointerDown, this);
    this.on('pointerup', this.onPointerUp, this);

    scene.add.existing(this);
  }

  drawGlow(alpha = 0.35) {
    this.glow.clear();
    const w = this.btnWidth + 12;
    const h = this.btnHeight + 12;
    this.glow.fillStyle(this.glowColor, alpha);
    this.glow.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
  }

  drawBg() {
    this.bg.clear();
    const w = this.btnWidth;
    const h = this.btnHeight;
    this.bg.fillStyle(this.bgColor, this.bgAlpha);
    this.bg.fillRoundedRect(-w / 2, -h / 2, w, h, 4);
  }

  drawBorder(alpha = 0.65, lineWidth = 1) {
    this.border.clear();
    const w = this.btnWidth;
    const h = this.btnHeight;
    const hw = w / 2;
    const hh = h / 2;
    const corner = 8;

    // Subtle outline
    this.border.lineStyle(lineWidth, this.accentColor, alpha * 0.45);
    this.border.strokeRoundedRect(-hw, -hh, w, h, 4);

    // Tech corner brackets (high-tech aesthetic)
    this.border.lineStyle(1.8, this.accentColor, Math.min(1, alpha + 0.3));

    // Top-Left
    this.border.beginPath();
    this.border.moveTo(-hw, -hh + corner);
    this.border.lineTo(-hw, -hh);
    this.border.lineTo(-hw + corner, -hh);
    this.border.strokePath();

    // Top-Right
    this.border.beginPath();
    this.border.moveTo(hw - corner, -hh);
    this.border.lineTo(hw, -hh);
    this.border.lineTo(hw, -hh + corner);
    this.border.strokePath();

    // Bottom-Left
    this.border.beginPath();
    this.border.moveTo(-hw, hh - corner);
    this.border.lineTo(-hw, hh);
    this.border.lineTo(-hw + corner, hh);
    this.border.strokePath();

    // Bottom-Right
    this.border.beginPath();
    this.border.moveTo(hw - corner, hh);
    this.border.lineTo(hw, hh);
    this.border.lineTo(hw, hh - corner);
    this.border.strokePath();
  }

  onPointerOver() {
    if (this.isTransitioning) return;
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 160,
      ease: 'Power2',
    });
    this.drawGlow(0.7);
    this.drawBorder(0.95, 1.5);
  }

  onPointerOut() {
    if (this.isTransitioning) return;
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.0,
      scaleY: 1.0,
      duration: 160,
      ease: 'Power2',
    });
    this.drawGlow(0.35);
    this.drawBorder(0.65, 1);
  }

  onPointerDown() {
    if (this.isTransitioning) return;
    this.scene.tweens.add({
      targets: this,
      scaleX: 0.96,
      scaleY: 0.96,
      duration: 80,
      ease: 'Power2',
    });
  }

  onPointerUp() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.disableInteractive();

    if (this.idleTween) {
      this.idleTween.stop();
    }

    // Flash border/glow on click
    this.drawGlow(0.95);
    this.drawBorder(1.0, 2);

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.06,
      scaleY: 1.06,
      alpha: 0.85,
      duration: 100,
      yoyo: true,
      onComplete: () => {
        if (typeof this.onClick === 'function') {
          this.onClick();
        }
      },
    });
  }

  destroy(fromScene) {
    if (this.idleTween) {
      this.idleTween.stop();
    }
    super.destroy(fromScene);
  }
}

export default SciFiButton;
