#----------------------------------------------
# Setting of the locations of compilers and sources.
# Change them according to your setup.
# ----------------------------------------------


# Location of flex-sdk: 		
# specify the path to your local installation of flex SDK 
# Change to the folder where you instlled SDK.
ifndef OSTYPE
  OSTYPE = $(shell uname -s | awk '{print tolower($$0)}')
  #export OSTYPE
endif

ifeq ($(OSTYPE), linux)
  FLEX=/home/alex/PROJECTS/FITTEST/Software/tools/flex
else ifeq ($(OSTYPE), darwin)
  #FLEX="/Users/cdnguyen/programs/flex_sdk_4.6"
  FLEX="/Applications/Adobe Flash Builder 4.5/sdks/4.5.0"
else
  #FLEX=c:/apps/flex4.0
  #FLEX=c:/apps/flex4.1
  FLEX=c:/apps/flex4.5.1
endif
 
# The compilers:
MXMLC=$(FLEX)/bin/mxmlc
COMPC=$(FLEX)/bin/compc

# Path to flex libraries
FLEXLIB=$(FLEX)/frameworks/libs

# Location of FITTEST logging-lib source base:
LOGGERLIB=../../../../UtrechtUniv/tools/LoggingUtils/v1.3

# Location of FITTEST Automation-lib source base:
AUTOMATIONLIB=../../../../UPVLC/workspace/eu.fittest.flash/eu.fittest.flash.automation

# Location of FITTEST Automation loader:
AUTLOADER=../../../../UPVLC/workspace/eu.fittest.flash/eu.fittest.flash.automation.applicationloader/v2

# Location of FITTEST Flex automation-delegates:
FLEXAUTDELG=../../../../UPVLC/workspace/eu.fittest.flash/eu.fittest.flash.automation.flex-delegates

prep:
	mkdir -p $(BIN)
	
# ---------
# Building various components first...
# ---------

# The directory to put the final swfs and the resources they need for runtime:
BIN=./target


# Virtual host directory:
VHOST=/var/www/flxdebugger

# turn on to compile with debug-mode enabled
DEBUG=-debug=true

# turn on to enable incremental compilarion
INCRmode=-incremental=true

# turn off AS sources generation
ASGenerate=-keep-generated-actionscript=false

# Build the FITTEST automation lib, and wrap it as swc:
automation.swc:
	echo "*** building automationMin.swc"
	$(COMPC) -source-path $(AUTOMATIONLIB)/src/main/flex \
	-output ./logger1.3/libs/automation.swc \
	$(INCRmode) \
	$(DEBUG) \
	-include-classes eu.fittest.actionscript.automation.Automation  eu.fittest.actionscript.automation.Delegate eu.fittest.actionscript.automation.ClickableDelegate eu.fittest.actionscript.automation.Command eu.fittest.actionscript.automation.RecordEvent eu.fittest.actionscript.automation.InitEvent

flashloggerLib.swc: automation.swc
	echo "*** building logUtils.swc"
	$(COMPC) -library-path+=./logger1.3/libs/automation.swc \
	-source-path $(LOGGERLIB)/src \
	$(DEBUG) \
	$(INCRmode) \
	-output ./logger1.3/libs/flashloggerLib.swc \
	-include-classes eu.fittest.Logging.Serialization.Delegates eu.fittest.Logging.Serialization.Serializable eu.fittest.Logging.Serialization.Serializer eu.fittest.Logging.Serialization.FittestSerializer eu.fittest.Logging.Serialization.SimpleSerializer eu.fittest.Logging.Serialization.SomeSerializationDelegates eu.fittest.Logging.Serialization.EventSerializableDelegates eu.fittest.Logging.Serialization.MxUISerializableDelegates eu.fittest.Logging.LAppEvent eu.fittest.Logging.DynAppState eu.fittest.Logging.LoggerBase eu.fittest.Logging.ByteArrayLogger eu.fittest.Logging.FittestLogger eu.fittest.Logging.replay.LogReplay eu.fittest.Logging.FittestLoggerHook	
	    
# Build the automation-loader:	
AutomationLoader.swf: automation.swc prep	
	echo "*** Bulding AutomationLoader.swf"
	$(MXMLC) -library-path+=./logger1.3/libs/automation.swc \
	$(INCRmode) \
	$(DEBUG) \
	-source-path $(AUTLOADER)/main/flex \
	-static-link-runtime-shared-libraries=true \
	-output $(VHOST)/AutomationLoader.swf  \
	-- $(AUTLOADER)/main/flex/eu/fittest/actionscript/automation/loader/AutomationLoader.as

# Build the set of flex automation-delegates:
FlexDelegates.swf: automation.swc prep
	echo "*** Building set of flex automation-delegates"
	$(MXMLC) -library-path+=./logger1.3/libs/automation.swc \
	$(INCRmode) \
	$(DEBUG) \
	-source-path $(FLEXAUTDELG)/src/main/flex \
	-static-link-runtime-shared-libraries=true \
	-output $(VHOST)/FlexDelegates.swf  \
	-- $(FLEXAUTDELG)/src/main/flex/eu/fittest/actionscript/automation/delegates/flex/FlexDelegates.as
  
# ---------
# Building the logger
# ---------

# Building the logger. The -static-link option forces the compiler
# to include Flex framwork packaged to be included in the resulting
# swf, and hence bloating its size. NOT NICE! But I can't get around
# this. Need more info...
#
# 	-static-link-runtime-shared-libraries=true \
#
logger.swf: flashloggerLib.swc prep
	echo "*** Building logger.swf"
	$(MXMLC) -library-path+=./logger1.3/libs \
	$(INCRmode) \
	$(DEBUG) \
	-source-path ./logger1.3/src \
	-output $(VHOST)/logger.swf  \
	-- ./logger1.3/src/MyFittestLogger.as	
  
# ---------
# Building the main application  ...
# ---------

APPSRC=./src/main/flexstore5/flex

beige.swf: prep
	echo "*** building beige.css"
	$(MXMLC)  \
	$(INCRmode) \
	-static-link-runtime-shared-libraries=true \
	-source-path $(APPSRC) \
	-output $(VHOST)/beige.swf -- $(APPSRC)/beige.css

blue.swf: prep
	echo "*** building blue.css"
	$(MXMLC) \
	$(INCRmode) \
	-static-link-runtime-shared-libraries=true \
	-source-path $(APPSRC) \
	-output $(VHOST)/blue.swf -- $(APPSRC)/blue.css

# Removing this option from flexstore compilation, not needed and gives problem
# for abci:
#     -static-link-runtime-shared-libraries=true \
# Removing this dependency; logging is now completely detached from the app:
#	-library-path+=./logger/libs
#
flexstore.swf: prep
	echo "*** building the main application..."
	$(MXMLC)  \
	$(INCRmode) \
	$(DEBUG) \
	$(ASGenerate) \
	-theme $(FLEX)/frameworks/themes/Halo/halo.swc \
	-source-path $(APPSRC) \
	-output $(VHOST)/flexstore.swf -- $(APPSRC)/flexstore.mxml

# ---------
# Building all infastructure needed to run the main application
# ---------
copystuffs: prep
	echo "*** Copying stuffs needed to run the main application"
	mkdir -p $(VHOST)/data
	mkdir -p $(VHOST)/assets
	mkdir -p $(VHOST)/assets/pic
	rsync -u $(APPSRC)/data/catalog.xml $(VHOST)/data/
	rsync -u $(APPSRC)/assets/*.png $(VHOST)/assets/
	rsync -u $(APPSRC)/assets/*.jpg $(VHOST)/assets/
	rsync -u $(APPSRC)/assets/*.flv $(VHOST)/assets/
	rsync -u $(APPSRC)/assets/pic/*.gif $(VHOST)/assets/pic/
	rsync -u ./src/main/resources/*.swf   $(VHOST)/
	rsync -u ./src/main/resources/*.html  $(VHOST)/
	rsync -u ./src/main/resources/*.js    $(VHOST)/
	rsync -u ./src/main/resources/*.css   $(VHOST)/
	rsync -u ./src/main/resources/*.txt   $(VHOST)/

	mkdir -p $(VHOST)/debugger
	rsync -u ./src/main/resources/debugger/*.* $(VHOST)/debugger/


	mkdir -p $(VHOST)/logs
	# rsync -u ./src/main/resources/logs/*.log $(VHOST)/logs/
	rsync -u ./src/main/resources/logs/*.* $(VHOST)/logs/

	mkdir -p $(VHOST)/randomGenerator
	rsync -u ./src/main/resources/randomGenerator/*.js $(VHOST)/randomGenerator/
# ---------
# Building whole...
# ---------

# Building the test-generator
testgen: 
	cp ./src/main/resources/randomGenerator/*.js $(VHOST)/randomGenerator/

# Bilding debugger
debugger: 
	cp -v ./src/main/resources/debugger/*.* $(VHOST)/debugger/

# Building the main application
app: beige.swf blue.swf copystuffs flexstore.swf



# To build all	
all: AutomationLoader.swf FlexDelegates.swf logger.swf app testgen 

clean:
	rm -r -f $(VHOST)/*
	rm -r -f $(BIN)/*
	rm -f ./logger/libs/*

flexstore3: 
	$(eval APPSRC := ./src/main/flexstore3/flex)
	@echo $(APPSRC)

flexstore5: 
	$(eval APPSRC := ./src/main/flexstore5/flex)
	@echo $(APPSRC)
	make all

