/* eslint-disable max-len */
/* global APP, config, interfaceConfig, JitsiMeetJS */

import Button from '@atlaskit/button';
import { FieldTextStateless } from '@atlaskit/field-text';
import { AtlasKitThemeProvider } from '@atlaskit/theme';
import React from 'react';
import { connect } from 'react-redux';

import { initAnalytics } from '../../analytics';
import { translate } from '../../base/i18n';
import { isAnalyticsEnabled } from '../../base/lib-jitsi-meet';
import { Watermarks } from '../../base/react';
import { HideNotificationBarStyle } from '../../unsupported-browser';

import { AbstractWelcomePage, _mapStateToProps } from './AbstractWelcomePage';

/**
 * The Web container rendering the welcome page.
 *
 * @extends AbstractWelcomePage
 */
class WelcomePage extends AbstractWelcomePage {
    /**
     * Initializes a new WelcomePage instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);
        this.state = {
            ...this.state,
            fName: '',
            lName: '',
            address: '',
            phoneNumber: '',
            healthCardNumber: ''
        };


        /**
         * The HTML Element used as the container for additional content. Used
         * for directly appending the additional content template to the dom
         *
         * @private
         * @type {HTMLTemplateElement|null}
         */
        this._additionalContentRef = null;

        /**
         * The template to use as the main content for the welcome page. If
         * not found then only the welcome page head will display.
         *
         * @private
         * @type {HTMLTemplateElement|null}
         */
        this._additionalContentTemplate = document.getElementById(
            'welcome-page-additional-content-template');

        // Bind event handlers so they are only bound once per instance.
        this._onFormSubmit = this._onFormSubmit.bind(this);
        this._onRoomChange = this._onRoomChange.bind(this);
        this._setAdditionalContentRef
            = this._setAdditionalContentRef.bind(this);
    }

    /**
     * Implements React's {@link Component#componentDidMount()}. Invoked
     * immediately after this component is mounted.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentDidMount() {
        document.body.classList.add('welcome-page');

        // FIXME: This is not the best place for this logic. Ideally we should
        // use features/base/lib-jitsi-meet#initLib() action for this use case.
        // But currently lib-jitsi-meet#initLib()'s logic works for mobile only
        // (on web it ends up with infinite loop over initLib).
        JitsiMeetJS.init({
            enableAnalyticsLogging: isAnalyticsEnabled(APP.store),
            ...config
        }).then(() => {
            initAnalytics(APP.store);
        });

        if (this.state.generateRoomnames) {
            this._updateRoomname();
        }

        if (this._shouldShowAdditionalContent()) {
            this._additionalContentRef.appendChild(
                this._additionalContentTemplate.content.cloneNode(true));
        }
    }

    /**
     * Removes the classname used for custom styling of the welcome page.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentWillUnmount() {
        document.body.classList.remove('welcome-page');
    }

    handleHealthCardChange = (e) => {
        this.setState({
            healthCardNumber: e.target.value
        });
    };

    handleFirstNameChange = (e) => {
        this.setState({
            fName: e.target.value
        });
    };
    handleLastNameChange = (e) => {
        this.setState({
            lName: e.target.value
        });
    };
    handleAddressChange = (e) => {
        this.setState({
            address: e.target.value
        });
    };
    handlePhoneNumberChange = (e) => {
        this.setState({
            phoneNumber: e.target.value
        });
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement|null}
     */

    render() {

        let text = {
            color: 'ffffff',
            visibility: 'hidden',
            textalign: 'center'
        };

        let white = {
            color: 'ffffff'
        };

        const { t } = this.props;
        const { APP_NAME } = interfaceConfig;
        const showAdditionalContent = this._shouldShowAdditionalContent();

        return (
            <AtlasKitThemeProvider mode = 'light'>
                <div
                    className = { `welcome ${showAdditionalContent
                        ? 'with-content' : 'without-content'}` }
                    id = 'new_welcome_page'>
                    <div className = 'header'>
                        <br>
                        </br>
                        <img
                            src='https://m-healthsolutions.com/wp-content/uploads/2018/05/m-health-solutions_logo_Transparent.png'
                            id='pictureDoctor' width = "20%" heigth = "20%" >
                        </img>
                        <div className = 'header-image' />
                        <Watermarks />
                        <div className = 'header-text'>
                            <h1 className = 'header-text-title'>
                                { t('welcomepage.title') }
                            </h1>
                            <p className = 'header-text-description'>
                                { t('welcomepage.appDescription',
                                    { app: APP_NAME }) }
                            </p>
                        </div>
                        <h2 id = 'introTxt' style =  { white }> Please Enter the information below if you are new and need to talk to a doctor</h2>
                        <h1 id = 'msgTxt' style = { text } >Information was sent to m-Health, we will get back to you shortly</h1>
                        <div id = 'new_enter_room'>
                            <form
                                className = 'enter-room-input'
                                onSubmit = { this._onFormSubmit }>
                                <FieldTextStateless
                                    name = 'HealthCardNumber'
                                    autoFocus = { false }
                                    id = 'enter_room_field'
                                    isLabelHidden = { true }
                                    label = 'enter_room_field'
                                    placeholder = 'Health Card Number'
                                    required
                                    shouldFitContainer = { true }
                                    type = 'number'
                                    value ={ this.state.healthCardNumber }
                                    onChange = { this.handleHealthCardChange }
                                />
                                <FieldTextStateless
                                    autoFocus = { false }
                                    id = 'enter_fName_field'
                                    isLabelHidden = { true }
                                    label = 'enter_fName_field'
                                    placeholder = 'First Name'
                                    required
                                    shouldFitContainer = { true }
                                    type = 'text'
                                    value = { this.state.fName }
                                    onChange = {this.handleFirstNameChange}/>
                                <FieldTextStateless
                                    autoFocus = { false }
                                    id = 'enter_lName_field'
                                    isLabelHidden = { true }
                                    label = 'enter_lName_field'
                                    placeholder = 'Last Name'
                                    required
                                    shouldFitContainer = { true }
                                    type = 'text'
                                    value = { this.state.lName }
                                    onChange = {this.handleLastNameChange}/>
                                <FieldTextStateless
                                    autoFocus = { false }
                                    id = 'enter_address_field'
                                    isLabelHidden = { true }
                                    label = 'enter_address_field'
                                    placeholder = 'Address'
                                    required
                                    shouldFitContainer = { true }
                                    type = 'text'
                                    value = { this.state.address }
                                    onChange = {this.handleAddressChange}/>
                                <FieldTextStateless
                                    autoFocus = { false }
                                    id = 'enter_phoneNumber_field'
                                    isLabelHidden = { true }
                                    label = 'enter_phoneNumber_field'
                                    placeholder = 'PhoneNumber'
                                    required
                                    shouldFitContainer = { true }
                                    type = 'number'
                                    value = { this.state.phoneNumber }
                                    onChange = {this.handlePhoneNumberChange}/>
                                <Button
                                    appearance = 'primary'
                                    className = 'welcome-page-button'
                                    id = 'enter_info_button'
                                    type = 'submit'>
                                    Send Info
                                </Button>
                            </form>

                            {/*<Button*/}
                                {/*appearance = 'primary'*/}
                                {/*className = 'welcome-page-button'*/}
                                {/*id = 'enter_room_button'*/}
                                {/*onClick = { this._onJoin }*/}
                                {/*type = 'button'>*/}
                                {/*{ t('welcomepage.go') }*/}
                            {/*</Button>*/}

                        </div>
                    </div>
                    { showAdditionalContent
                        ? <div
                            className = 'welcome-page-content'
                            ref = { this._setAdditionalContentRef } />
                        : null }
                </div>
                <HideNotificationBarStyle />
            </AtlasKitThemeProvider>
        );
    }

    /**
     * Prevents submission of the form and delagates join logic.
     *
     * @param {Event} event - The HTML Event which details the form submission.
     * @private
     * @returns {void}
     */
    _onFormSubmit(event) {
        event.preventDefault();
        console.log(this.state.healthCardNumber);
        console.log(this.state.fName);
        console.log(this.state.lName);
        console.log(this.state.address);
        console.log(this.state.phoneNumber);
        let consent = false;
        while (consent === false) {
            const response = confirm('Is all information correct?. Press Ok to accept');
            if (response === true) {
                consent = true;
                document.getElementById('new_enter_room').style.visibility = 'hidden';
                document.getElementById('enter_fName_field').style.visibility = 'hidden';
                document.getElementById('enter_lName_field').style.visibility = 'hidden';
                document.getElementById('enter_address_field').style.visibility = 'hidden';
                document.getElementById('enter_phoneNumber_field').style.visibility = 'hidden';
                document.getElementById('msgTxt').style.visibility = 'visible';
                document.getElementById('introTxt').style.visibility = 'hidden';

            } else {
                return;
            }

        }
    }

    /**
     * Overrides the super to account for the differences in the argument types
     * provided by HTML and React Native text inputs.
     *
     * @inheritdoc
     * @override
     * @param {Event} event - The (HTML) Event which details the change such as
     * the EventTarget.
     * @protected
     */
    _onRoomChange(event) {
        super._onRoomChange(event.target.value);
    }

    /**
     * Sets the internal reference to the HTMLDivElement used to hold the
     * welcome page content.
     *
     * @param {HTMLDivElement} el - The HTMLElement for the div that is the root
     * of the welcome page content.
     * @private
     * @returns {void}
     */
    _setAdditionalContentRef(el) {
        this._additionalContentRef = el;
    }

    /**
     * Returns whether or not additional content should be displayed belowed
     * the welcome page's header for entering a room name.
     *
     * @private
     * @returns {boolean}
     */
    _shouldShowAdditionalContent() {
        return interfaceConfig.DISPLAY_WELCOME_PAGE_CONTENT
            && this._additionalContentTemplate
            && this._additionalContentTemplate.content
            && this._additionalContentTemplate.innerHTML.trim();
    }
}

export default translate(connect(_mapStateToProps)(WelcomePage));
