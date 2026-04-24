# Themes

**Note: This is a work in progress.**

## Resources

[tweakcn](https://tweakcn.com) - Generate themes
[tints.dev](https://www.tints.dev) - Convert single color into 10-color palette
[tailcolor](https://tailcolor.com) - Convert single color into 10-color palette

### Tweakcn prompt

Tweakcn will let you generate a theme baseline to work with. This is the prompt I have used:

```md
I would like a theme generated with a primary color of #7201d3 and a 
secondary color of #4a86e8, with an accent color of #ff9e01 
(these are all dark mode, please generate appropriate light mode variants). 
I would like the sidebar colors to be pronounced and distinguished from the 
other content, with the primary color and various shades integrated 
tastefully to separate things like sidebars, navbar, main content, etc. 
Themes leaning towards more high contrast than less are preferred.
```

## Accessibility

All themes should account for Deuteranopia and Protanopia color blindness.

### Deuteranopia

Deuteranopia is a type of red-green color blindness where the green cones in the eye are absent.
This results in difficulty distinguishing between reds and greens.

**If your theme uses the colors red and green**, you should provide a color override for green in the deuteranopia specific theme.

### Protanopia

Protanopia is another type of red-green color blindness where the red cones in the eye are absent.
This results in difficulty distinguishing between reds and greens.

**If your theme uses the colors red and green**, you should provide a color override for red in the protanopia specific theme.
