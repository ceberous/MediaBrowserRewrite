#!/usr/bin/python

import smtplib
from email.MIMEMultipart import MIMEMultipart
from email.MIMEText import MIMEText

import securityDetails as sD
import emailMessage

from time import localtime, strftime
from datetime import datetime
from pytz import timezone

eastern_tz = timezone('US/Eastern')
pacific_tz = timezone('US/Pacific')

def sendEmail( wSubject , msg ):

        wMessage = MIMEMultipart()
        wMessage['From'] = sD.fromEmail
        wMessage['To'] = sD.destinationEmail
        wMessage['Subject'] = wSubject
        wMessage.attach( MIMEText( msg ) )

        try:
                server = smtplib.SMTP( sD.fromEmailSMTP , 587 )
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login( sD.fromEmail ,  sD.fromEmailPass  )
                server.sendmail( sD.fromEmail , sD.destinationEmail , wMessage.as_string() )
                server.close()
                print('sent email')
        except:
                print('failed to send email')


sendEmail( "Horescope" , emailMessage.wMSG )