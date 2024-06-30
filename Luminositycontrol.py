import screen_brightness_control as sbc

def list_monitors():
    monitors = sbc.list_monitors()
    print('Available monitors:')
    for i, monitor in enumerate(monitors):
        print(f'{i}: {monitor}')
    return monitors

def set_brightness(brightness, display=None):
    if display is not None:
        # Assuming sbc.set_brightness sets the brightness for the specified display
        sbc.set_brightness(brightness, display=display)
        current_brightness = sbc.get_brightness(display=display)
        print(f"Set brightness of {display} to {brightness}%")
        print(f"Current brightness of {display}: {current_brightness}")
    else:
        sbc.set_brightness(brightness)
        current_brightness = sbc.get_brightness()
        print(f"Set brightness of primary display to {brightness}%")
        print(f"Current brightness of primary display: {current_brightness}")

if __name__ == '__main__':
    monitors = list_monitors()
    # Set the brightness of the primary display to 100%
    set_brightness(100)
    
    # If there are multiple monitors, set the brightness of the second monitor
    if len(monitors) > 1:
        set_brightness(100, display=monitors[1])

