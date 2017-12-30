BUILD = ./build
NAME = werewolf@bonsaimind.org
SRC = ./src

all: $(BUILD)/$(NAME).xpi

$(BUILD)/$(NAME).xpi:
	mkdir --parent $(BUILD)
	cd $(SRC); zip -r ../$@ *; cd -
	zip $@ CHANGELOG
	zip $@ LICENSE
	zip $@ README
	
clean:
	$(RM) $(BUILD)/$(NAME).xpi
	$(RM) -R $(BUILD)

