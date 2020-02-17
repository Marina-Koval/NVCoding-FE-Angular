import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmailService } from '../../../services/email.service';
import CampaignSending from '../../../models/campaignSending.model';
import { CampaignsService } from '../../../services/campaigns.service';
import CampaignCreatingTransferModel from '../../../models/campaignCreatingTransfer.model';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { SummaryInitializer } from '../../../initializers/email-campaigns/summary';
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
    selector: 'app-choose-schedule-review',
    templateUrl: './choose.schedule.review.html',
    styleUrls: ['./choose.schedule.review.css']
})

export class ChooseScheduleReviewComponent implements OnInit {

    public completeObject: CampaignCreatingTransferModel;
    public isDisabled: boolean;
    public summaryInitializer: any;
    public date: number;
    public defaultDate: Date;
    public clientPublicIp: string;
    public isRequesting = false;
    public errorMessage = '';
    public customDate: string;

    constructor(private route: Router, private emailService: EmailService,
        private campaignsService: CampaignsService, private ngxSmartModalService: NgxSmartModalService) {
            let currentDate = new Date();
            currentDate.setMinutes(currentDate.getMinutes() + 15);
            this.defaultDate = currentDate;
            this.date = currentDate.getTime();
        }

    navigateToPreviousStep() {
        this.route.navigate(['choose-template']);
    }

    sendBulk() {
        this.errorMessage = '';
        this.isRequesting = true;
        this.campaignsService.saveCampaign(this.getRequestData())
        .finally(() => this.isRequesting = false)
        .subscribe(
            (result) => {
	            this.route.navigate(['campaigns']);
            },
            (error) => {
                this.errorMessage = error.error.errorMessage;
        });
    }

    cancel() {
        this.route.navigate(['/campaigns']);
    }

    toggle() {
        this.isDisabled = !this.isDisabled;
    }

    datePicker(date) {
        this.date = date.getTime();
    }

    openTestBulkEmailModal() {
        this.ngxSmartModalService.getModal('testBulkModal').open();
    }

    getEmailName(emailName) {
        const testBulkRequestData = this.getRequestData();
        testBulkRequestData.tos = [emailName];
        this.campaignsService.sendTestEmail(testBulkRequestData).subscribe(res => {
        });
    }

    private getRequestData() {
        const now = new Date();
        const model = new CampaignSending();
        model.tos = this.completeObject.recipients;
        model.subject = this.completeObject.subject;
        model.content = this.completeObject.template.body;
        model.addUnsubscribeLink = this.completeObject.addUnsubscribeLink;
        model.addAddress = this.completeObject.addAddress;
        model.addSignature = this.completeObject.addSignature;
        model.sendAfter = !this.isDisabled ? new Date(now).getTime() : this.date;
        model.campaignName = this.completeObject.campaignName;
        model.addTracking = this.completeObject.addTracking;
        model.createLead = this.completeObject.createLead;
        model.createLeadNumber = 2;
        return model;
    }

    openScheduleModal() {
        this.ngxSmartModalService.getModal('scheduleModule').open();
    }

    ngOnInit() {
        if (this.emailService.$completeObject === undefined) {
            this.route.navigate(['choose-template']);
        }
        this.completeObject = this.emailService.$completeObject;
        const summaryInitializer = new SummaryInitializer();
        summaryInitializer.completeObject = this.completeObject;
        this.summaryInitializer = summaryInitializer.init();
        // this.getPublicIp();
        this.isDisabled = true;
    }

    getModalTime(time: Date) {
        this.date = time.getTime();
        const date = moment(time).format('YYYY/MM/DD HH:mm:ss');
        this.customDate = date;
    }
}