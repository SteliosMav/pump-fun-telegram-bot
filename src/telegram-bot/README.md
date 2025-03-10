Each module has its main service, scene and update and then some nested/sub-scenes. These scenes, if they are small, they can be nested inside a general scenes folder. If they grow in size, complexity, or need their own markdown language or buttons to display etc, they can go into their own folder outside of the scenes folder. That folder will have a name that will represent the context of that module.

Have separate enums for Scenes, Callbacks and Commands. Not all Scenes enter through Callbacks. For example a "help" scene could enter through a command only /help.
