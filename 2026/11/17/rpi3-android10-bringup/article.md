# 树莓派 3B 跑 Android 10：DSI 显示、触摸适配与 SD 卡整包

最近在 rpi3bdroid 中继续推进树莓派 3B 的 Android 10 bring-up。目标是把源码编译、屏幕适配和 SD 卡制作串起来，让每次修改都有对应的代码和验证入口。

本文记录 2026 年 11 月 6 日至 15 日已提交到 GitHub 的修改，并整理目前的实机观察。**当前阶段：DSI 显示已点亮，触摸仍有异常；整包脚本已经入库，但不能据此认定所有硬件功能都已验证完成。**

## 1. 基线与当前进展

| 项目 | 本次使用的基线或状态 |
| --- | --- |
| 开发板 | Raspberry Pi 3B |
| Android | AOSP `android-10.0.0_r32` |
| 内核 | `kernel_rpi` 的 `arpi-4.19.y` 分支，4.19.108 基线 |
| 屏幕 | Waveshare 5 英寸 DSI 触摸屏，800 × 480 |
| 显示 | 实机已显示 Android 界面；`wm size` 为 800 × 480 |
| 触摸 | 已出现 `generic ft5x06 (17)` 输入设备，但此前采集仍存在 X 变化、Y 未正常上报的现象，尚未闭环 |
| SD 卡制作 | 新增 `make-sdcard-image.py`，生成带分区表的整盘 `.img` |

公开仓库沿用 android-rpi 项目的基础工作。本次新增内容集中在设备仓和内核仓，并通过 rpi3bdroid 组织持续记录。

## 2. 仓库组织与源码同步

涉及的仓库和分支如下。图形组件使用的分支名称与 Android 版本并不相同，应以 manifest 中逐项指定的 revision 为准。

| 源码路径 | 仓库 | 分支 |
| --- | --- | --- |
| `.repo/local_manifests` | [local_manifests](https://github.com/rpi3bdroid/local_manifests/tree/android10) | `android10` |
| `device/brcm/rpi3` | [device_brcm_rpi3](https://github.com/rpi3bdroid/device_brcm_rpi3/tree/android10) | `android10` |
| `kernel/rpi` | [kernel_rpi](https://github.com/rpi3bdroid/kernel_rpi/tree/arpi-4.19.y) | `arpi-4.19.y` |
| `hardware/rpi` | [hardware_rpi](https://github.com/rpi3bdroid/hardware_rpi/tree/android10) | `android10` |
| `external/mesa3d` | [external_mesa3d](https://github.com/rpi3bdroid/external_mesa3d/tree/rpi3-19.1) | `rpi3-19.1` |
| `external/drm_gralloc` | [external_drm_gralloc](https://github.com/rpi3bdroid/external_drm_gralloc/tree/rpi3-19.1) | `rpi3-19.1` |
| `vendor/arpi/RpLauncher` | [RpLauncher](https://github.com/rpi3bdroid/RpLauncher/tree/android10) | `android10` |

记录时，`local_manifests/android10` 的 remote 指向本地 Gerrit。外部复现时，需要把工作副本中的 remote 改为 GitHub 组织地址。以下命令用于已经完成 AOSP `android-10.0.0_r32` 初始化、且尚未创建 `.repo/local_manifests` 的源码目录：

```bash
git clone --branch android10 \
  https://github.com/rpi3bdroid/local_manifests.git .repo/local_manifests

python3 - <<'PY'
from pathlib import Path
import xml.etree.ElementTree as ET

manifest = Path('.repo/local_manifests/default.xml')
tree = ET.parse(manifest)
remote = tree.getroot().find("remote[@name='arpi']")
if remote is None:
    raise SystemExit('arpi remote not found')
remote.set('fetch', 'https://github.com/rpi3bdroid/')
remote.attrib.pop('review', None)
tree.write(manifest, encoding='UTF-8', xml_declaration=True)
PY

repo sync -j4
```

如果已有 local manifest，先对照现有配置合并。上面的改动仅用于公开下载入口；后续同步和代码评审地址应按自己的环境维护。

## 3. 内核产物统一放到 KERNEL_OBJ

11 月 6 日的修改把内核构建改为独立输出目录：

```text
out/target/product/rpi3/KERNEL_OBJ/
```

这样，`zImage`、DTB 和 overlay 都有明确的产物路径，整包脚本也可以从同一个位置取文件。对应提交：[1952684](https://github.com/rpi3bdroid/device_brcm_rpi3/commit/1952684cea1c99c953e40fba7051e2ec5ea6cce2)。

从 Android 源码根目录开始：

```bash
sudo apt install gcc-arm-linux-gnueabihf libssl-dev
cd kernel/rpi
KERNEL_OBJ=$(realpath -m ../../out/target/product/rpi3/KERNEL_OBJ)
mkdir -p "$KERNEL_OBJ"

ARCH=arm scripts/kconfig/merge_config.sh -O "$KERNEL_OBJ" \
  arch/arm/configs/bcm2709_defconfig \
  kernel/configs/android-base.config \
  kernel/configs/android-recommended.config

ARCH=arm CROSS_COMPILE=arm-linux-gnueabihf- \
  make O="$KERNEL_OBJ" -j4 zImage dtbs
cd ../..
```

这里仍然构建 ARM 32 位内核，不能仅因为板上 CPU 支持 ARM64，就把命令中的 `ARCH=arm` 改为 `arm64`。同时，需要核对合并后实际生效的 `.config`：

```bash
rg -n 'CONFIG_(DRM_VC4|DRM_PANEL_RASPBERRYPI_TOUCHSCREEN|TOUCHSCREEN_EDT_FT5X06)=' \
  out/target/product/rpi3/KERNEL_OBJ/.config
```

本次 defconfig 将面板驱动和 EDT 触摸驱动由模块改为内建，预期上述三项均为 `y`。

Android 部分继续使用项目原来的产品配置：

```bash
source build/envsetup.sh
lunch rpi3-eng
make -j4 ramdisk systemimage vendorimage
```

这组命令用于已配置好的 AOSP 构建环境，主机依赖仍需要按实际发行版准备。

## 4. DSI 显示：把固件配置与内核拓扑对齐

设备仓 `boot/config.txt` 新增：

```ini
ignore_lcd=1
# Linux edt-ft5x06 owns the touch controller.
disable_touchscreen=1
```

这套配置配合 Linux VC4 KMS 和 EDT 驱动使用，意图是由内核接管显示、触摸，避免固件侧旧路径参与控制。`disable_touchscreen=1` 在这里不代表关闭 Linux EDT 输入驱动。

内核设备树同时做了几项调整：

- `i2c0` 使用 `i2c0_gpio44` 引脚组，配置为 100 kHz 并启用。
- 增加 I²C 地址 `0x45` 的面板节点，使用 `raspberrypi,7inch-touchscreen-panel` compatible。
- 启用 `dsi1`，用互相对应的 endpoint 连接 DSI 与面板。
- 增加地址 `0x38` 的触摸节点。

这里的 compatible 是本次复用的驱动绑定名称，不表示实物屏幕是 7 英寸。

Android 产品配置还删除了 `debug.drm.mode.force=1280x720`，让 DRM 按实际输出模式工作。实机调试时，`wm size` 已返回：

```text
Physical size: 800x480
```

**固件 ID 的处理仍属于诊断阶段。** 这块面板曾返回 `0x01`，原驱动不接受该值。本次在 `panel-raspberrypi-touchscreen.c` 增加 `case 0x01`，并打印：

```text
diagnostic: accepting panel firmware ID 0x01
```

这项修改允许继续验证后续链路，不能单凭“probe 通过”认定协议与上电时序完全兼容，也不能推广成所有同类屏幕的通用修复。

早期日志还出现过 `vc4-drm ... failed to bind ... dsi ... -517`。排查时要看最终的组件绑定与显示结果，不能把中间一次延迟探测直接当成最终故障结论。

## 5. 触摸：增加轮询路径，继续核对数据与事件

当前触摸设备树配置的核心部分为：

```dts
touchscreen@38 {
    compatible = "edt,edt-ft5506";
    reg = <0x38>;
    poll-interval = <17>;
    touchscreen-size-x = <800>;
    touchscreen-size-y = <480>;
    touchscreen-inverted-x;
    touchscreen-inverted-y;
};
```

`edt-ft5x06.c` 为无 IRQ 配置增加了 delayed work 轮询。当前设备树设置 17 ms 间隔；这是调度间隔配置，不是对触摸采样率的实测承诺。驱动限制轮询值为 10–1000 ms，并拒绝同时配置 IRQ 和轮询的情况。

数据处理也有同步调整：先读取头部中的触点数量，再读取对应触点数据；增加启动残留数据过滤、触点 ID 范围检查，以及对当前帧中消失的触点补报释放。挂起、恢复、工厂模式切换和卸载路径同步处理轮询工作的启停。

为继续定位问题，前 10 次数据处理会打印 `touch-diag`，包含读取返回值、原始字节、触点数量和解析得到的 X/Y 等信息。这些诊断记录有次数限制，后续抓取时应从启动阶段开始采集。

**目前仍待解决的是触摸事件异常。** 已注册输入节点，只说明输入设备创建成功；此前 `getevent` 中存在 X 变化而 Y 未正常上报的现象，还需要把控制器原始数据、驱动解析结果和 input 事件对齐。当前证据不足以认定是坐标反转、Android 输入映射或控制器协议中的哪一层导致。

下一轮验证只收集与这条链路直接有关的数据。以下命令在有 ADB 和 `rg` 的 Linux 主机执行：

```bash
adb shell dmesg | rg -i 'touch-diag|touch polling|ft5|firmware|vc4|dsi'
adb shell getevent -lp
# 根据上一条输出确认触摸设备节点；event0 仅为本次调试时的编号
adb shell getevent -lt /dev/input/event0
adb shell dumpsys input
```

手指分别做水平、竖直移动，再检查原始帧和 input 事件是否都随两轴变化。单帧没有重复出现 Y 事件，并不足以说明 Y 一定丢失；应结合持续竖直移动的记录判断。只有连续移动、点击、抬起及坐标方向都通过，才能把触摸标记为完成。

## 6. 把编译产物打成可直接刷写的 SD 卡镜像

此前需要手工分区、格式化和复制 BOOT 文件，再分别写入 system、vendor。新增脚本把这些步骤集中到源码树内：

```bash
sudo apt install fdisk dosfstools mtools e2fsprogs
python3 device/brcm/rpi3/make-sdcard-image.py
```

脚本本身不需要 root。默认从 `KERNEL_OBJ` 取本次构建的 `zImage`、DTB 和 `vc4-kms-v3d.dtbo`，再加上设备仓的启动文件与 Android 的 ramdisk、system、vendor，组成 MBR 整盘镜像。

默认布局采用 MiB 单位：

| 区域 | 起始位置（MiB） | 大小（MiB） | 用途 |
| --- | ---: | ---: | --- |
| 分区前保留区域 | 0 | 1 | MBR 与分区对齐 |
| BOOT | 1 | 256 | FAT32，启动固件、内核、DTB、ramdisk |
| system | 257 | 640 | Android system 镜像 |
| vendor | 897 | 128 | Android vendor 镜像 |
| userdata | 1025 | 3071 | 新建 ext4，卷标 `userdata` |
| 合计 | — | 4096 | 整盘镜像逻辑大小 |

脚本会检查产物存在性、system/vendor 大小和 Android sparse 镜像标识。**遇到 Android sparse 输入会退出并提示先用 `simg2img` 转换，当前没有自动转换功能。** 输出文件保留全零块的文件空洞，与 Android sparse 镜像格式是两回事；复制或压缩后占用空间可能变化，刷卡仍按完整逻辑大小计算。

脚本包含 FAT/ext4 文件系统检查、BOOT 文件回读比对、写入分区数据的 SHA-256 比对和分区表校验。完成后输出：

```text
out/target/product/rpi3/rpi3-android10-sdcard.img
out/target/product/rpi3/rpi3-android10-sdcard.img.sha256
out/target/product/rpi3/rpi3-android10-sdcard.img.layout.json
```

复制镜像后可以在其所在目录验证：

```bash
cd out/target/product/rpi3
sha256sum -c rpi3-android10-sdcard.img.sha256
```

这些检查验证的是打包数据的一致性，实际启动和硬件功能还需要上板验证。打包使用新建的空 userdata，不会保留之前 SD 卡中的用户数据。

### 为什么默认整包不能写进标称 4 GB 的卡？

默认镜像为 `4096 MiB = 4,294,967,296` 字节，而标称 4 GB 的卡通常约为 `4,000,000,000` 字节，容量小于整包的逻辑大小。即使镜像文件在主机上因空洞或压缩占用更小，也不能据此判断能写入。

当前默认整包使用 **8 GB 或更大的 SD 卡**。脚本支持 `--size-mib` 和 `--output` 自定义，但缩小会减少 userdata；参数被接受也不代表该容量已完成上板验证。

刷写时，在 Raspberry Pi Imager 中选择“Use custom／使用自定义镜像”，选择生成的 `.img`，核对目标 SD 卡后写入。写入会覆盖卡上原有数据。当前脚本不会自动把 userdata 扩展到更大卡的剩余空间。

## 7. Android 产品配置中的其余改动

同一次设备仓提交还显式加入 `Settings` 包，并把 Pi 3B 使用的 `brcmfmac43430-sdio.bin` 与 `.txt` 加入 ramdisk 的固件复制目标。这些属于包与固件布置的修改；Wi-Fi 是否连接稳定、设置项是否完整可用，仍应分别实测。

## 8. 对应提交与下一步

| 提交 | 主要内容 |
| --- | --- |
| [1952684 · build kernel](https://github.com/rpi3bdroid/device_brcm_rpi3/commit/1952684cea1c99c953e40fba7051e2ec5ea6cce2) | 内核独立输出目录与文档路径统一 |
| [740f835 · boot bringup [1]](https://github.com/rpi3bdroid/device_brcm_rpi3/commit/740f83507ee3dad7c8c29165d715b35adb76a07d) | SD 卡整包脚本、固件启动配置、DRM 模式与产品配置 |
| [c115a20 · boot bringup [2]](https://github.com/rpi3bdroid/kernel_rpi/commit/c115a20e14d09dc47b9f1d72de586ad4de80bb55) | DSI/触摸设备树、驱动内建、面板 ID 诊断兼容与触摸轮询 |

下一步先闭环触摸的 X/Y 与触点释放问题，再验证重启、休眠恢复和连续操作，随后记录整包刷写后的完整启动结果。每一项都以实际日志和操作结果更新状态。

相关入口：[rpi3bdroid 组织](https://github.com/rpi3bdroid) · [设备仓说明](https://github.com/rpi3bdroid/device_brcm_rpi3/blob/740f83507ee3dad7c8c29165d715b35adb76a07d/README) · [整包脚本源码](https://github.com/rpi3bdroid/device_brcm_rpi3/blob/740f83507ee3dad7c8c29165d715b35adb76a07d/make-sdcard-image.py)
