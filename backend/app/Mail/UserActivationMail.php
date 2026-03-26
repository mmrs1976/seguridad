<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UserActivationMail extends Mailable
{
    use Queueable;
    use SerializesModels;

    public function __construct(
        public string $userName,
        public string $activationUrl
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Activa tu cuenta',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.user-activation',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
