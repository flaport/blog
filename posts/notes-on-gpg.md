# My notes on GPG and PGP
_GPG_ stands for the 'GNU Privacy Guard'. It's the standard way to manage your _PGP_
keys on Linux. _PGP_, in turn, stands for 'Pretty Good Privacy'. With _PGP_ you
typically create a _public_/_private_ key pair which are respectively used to _encrypt_
and _decrypt_ messages. _PGP_ keys are mostly used to send sensitive information over
the internet or to prove your identity online.

In practice, sending information is done by first sharing your _public_ key with
everyone such that any person can use that key to encrypt the information they want to
send you. On receiving a message encrypted with your own _public_ key,
you can use your _private_ key to _decrypt_ it.

Conversely, if you're in possession of someones public key, you can use that _public_
key to _encrypt_ a message for that person, who can then decrypt it by using his private
key.

Usually, public keys can be _published_ on public key servers to make it easier for
others to find your public key and use it to send you encrypted information. However,
keep in mind that these public keys can never be deleted from a key server.

## Generating keys

To generate a public-private key pair, run the full `gpg` wizard. It's best to choose
the default options wherever possible.

```
$ gpg --full-gen-key
```

You'll be asked a few questions about your identity. Fill them out correctly... as PGP
is used to prove identity it's impossible to change the identity information on
your key later on.

## Exporting keys

First list your secret keys

```
$ gpg --list-secret-keys
```

Copy the id of the key you want to export. The ID is often defined as the _last 8_
(short ID) or _last 16_ (long ID) digits of the key fingerprint shown in the listing. Be
aware that collisions might happen with 8-digit short IDs. Often, you'll only have one
public key per email address, in which case the email address tied to the gpg key can
also be used as key ID.

To export a public key:

```
$ gpg --export --armor --output public.asc <key-id>
```

To export a private key:

```
$ gpg --export-secret-key --armor --output private.asc <key-id>
```

By default, the private key will be exported **and** encrypted with the same password
as you used to generate the key.

If you want to export your private key with a different password (or with no password),
you'll have to edit the key **before exporting**. Editing the password can for example
be done as follows:

```
$ gpg --edit-key <key-id>

Secret key is available.

---

gpg> passwd
```

First, enter the current password, then enter the new password twice (leave blank for no
password). You will also be asked to provide a new password for each of your subkeys.
After setting the new password (or removing the password), type `quit` to exit the
`gpg`-prompt.

You might have noticed the `--armor` flag used in the above export commands. The armor
command is used to export to (or import from) ASCII encoding (in stead of binary). If
you want to import/export to binary format, drop the `--armor` flag. Also in that case,
the convention is to use a `.pgp` extension for the exported key:

```
$ gpg --export --output public.pgp <key-id>
$ gpg --export-secret-key --output private.pgp <key-id>
```

## Publishing keys

To export (publish) your public key to a public key server, use:

```
$ gpg --keyserver <keyserver-uri> --send-key <key-id>
```

For example to publish your key on the ubuntu keyservers, use
`hkp://keyserver.ubuntu.com` as keyserver.

You can check if the key was published correctly by searching for it:

```
$ gpg --keyserver <keyserver-uri> --search <key-id>
```

## Importing keys

Both public and private keys can be imported from an exported key file as follows:

```
$ gpg --import public.asc
$ gpg --import private.asc
```

In case the private key was encrypted with a password, you'll need to provide it.

By default, imported public keys have the lowest trust level ('unknown'). If the
imported keys are indeed your own, you should increase the trust level to the 'ultimate'
level to prevent that some encryption programs refuse to use your own public key for
encryption. This can be done as follows:

```
$ gpg --edit-key <key-id>

gpg> trust

Please decide how far you trust this user to correctly verify other users' keys
(by looking at passports, checking fingerprints from different sources, etc.)

  1 = I don't know or won't say
  2 = I do NOT trust
  3 = I trust marginally
  4 = I trust fully
  5 = I trust ultimately
  m = back to the main menu

Your decision? 5
Do you really want to set this key to ultimate trust? (y/N) y
```

In general, it might also be a good idea to increase the trust level of imported public
keys you _don't_ own to a level you're comfortable with.

## Deleting keys

A public key can be deleted from your keyring as follows:

```
$ gpg --delete-key <key-id>
```

However, this will only work for public keys for which you do not own the private key.
Hence this is usually used to delete the public key of someone _else_ from your system.

To delete a personal public key from your system, you have to delete the private key
first.

However, if that means you will lose the private key forever, please
**make sure to revoke your public key from any public key server**
**before deleting the private key from your system!**

Indeed, revoking the public key will tell others to disregard it such that they
(hopefully) will start using a different public key that belongs to you which
hasn't been revoked (however, nothing is actually stopping them to keep on using the
old, revoked key).

The private key can be deleted from your system as follows:

```
$ gpg --delete-secret-key <key-id>
```

After which you'll be able to remove the public key as shown above. To simultaneously
delete both keys from your system, use:

```
$ gpg --delete-secret-and-public-key <key-id>
```

## Encrypting messages

To encrypt a message, first find the public key-id you want to use to encrypt the
message. As we know, this can be done with `gpg --list-keys`.

```
$ gpg --encrypt --armor --recipient <key-id> <filename>
```

Which will create a new encrypted file called `<filename>.asc` (or `<filename>.pgp` if
the `--armor` flag is removed).

A message from stdin can also be encrypted. For example:

```
$ echo "This message will be encrypted" | gpg --encrypt --armor --recipient <key-id>
```

Note that multiple recipients can be supplied by repeating the `--recipient` flag
multiple times. This will make sure the message can be decrypted by _all_ recipients
specified.

## Decrypting messages

To decrypt a message, you'll need to have at least one of the private keys belonging to
any of the public keys the message was encrypted with. Then the message can simply be
decrypted as:

```
$ gpg --decrypt <filename>
```

Or, for a message coming from stdin:

```
$ echo "This message will be encrypted then decrypted" | gpg --encrypt --armor --recipient <key-id> | gpg --decrypt
```

## My Public GPG key

That's it. Feel free to leave an encrypted comment below. This is my public gpg key:

```
-----BEGIN PGP PUBLIC KEY BLOCK-----

mQENBF3JgFoBCADAvDNVx9NW/kHaK61prTZNJawyrFbRF+31ziBW5W19VUEBLTGT
dxlGoem5oOX7+dDCbLJqfvOrhCdHzRuL4h9FGPg4pCLr+ME1aR1GqdE8eE7KjjXz
KlwpgaFCw1nhT7ctwLSeN7wgw7+v5aN/CtkNrL2I5ISmlz2VGYqQjWQ4FMmIKxeA
uC/CEpvZDVHLLEtCYxgLd3YUIB0zHopoqjJvZt2nmUqfyaB4AUBxgCZ8RVaNRHoT
5RGhbrcY3G2d7HRLcPvhG8oZZRZ6d9swmLA5DIKHD4PASqf7rtWLvVCsHR33htuS
ezUvGIFb4zkTrFG5/bam+DuxxM5t48SQT2BZABEBAAG0MEZsb3JpcyBMYXBvcnRl
ICgyMDIwKSA8ZmxvcmlzLmxhcG9ydGVAZ21haWwuY29tPokBVAQTAQgAPhYhBJdK
HTfLvN4DqDA0AO1fCo1vgtk/BQJdyYBaAhsDBQkCJcGABQsJCAcCBhUKCQgLAgQW
AgMBAh4BAheAAAoJEO1fCo1vgtk/VLUH/19iBgiXnO3V9eu7h2ykcKjJeaMxLLU0
5PRW2w9dazOt6l5qXXUEO6CQircE56teHimxrjJOY0oTbW8MyhvrbjFupYVoanDb
X52M+zNGkPOIJcYDCMrg2kRT7LLHLRrIz09TaUqyr3nOMWW9f9uOENYRh/S/oPKM
+L5l2XPjV/pU1XCy+GEpPjF4FOkt/qFrVri6DlKQuLCj+NRRSrltvxIP6Bdx8AbN
iOIfMYMA3zd1uh1TDTeK6gTwP8Hk1vpWth2m3DHClE2P/qevsngXun7xGGQIAplY
Igb5CzjGKsnmkauT6GV+FquzZYd8ELUfgLm9dY4+esfGObCJkoMaVx+5AQ0EXcmA
WgEIAKr3sz6eNGMKXyhdytcxfX9vGOoJf105iYas1MDGOFePfD6WJmJOR4ftTZg8
NBpfVmhKGoDO7mKFoHn+xxj9gyjylI8FVeD40vlxqpZ8sW7AV741SlGdtPdVcIFo
eL03OLB7hrE9Iky4k2GtfRSEPKEZYlBomthyI6IoOeYwc4bYO/Oubq12+Gw0oejJ
ekuLBoAZm0fIqreOeBtnbu85n7TiRPtSvZsZGcm12pVWZR9SajUwmPAt3RzErWI+
w3cQB6GO1lU3URbBfFWQEYugU0BNeYgZh0sl/ax5HcCUq63o7LDnPKqRxSVusErK
8MBNQfj1rH34dnsNi9OGB4PxHXMAEQEAAYkBPAQYAQgAJhYhBJdKHTfLvN4DqDA0
AO1fCo1vgtk/BQJdyYBaAhsMBQkCJcGAAAoJEO1fCo1vgtk/xPsH/i3b2/wB1EiE
daa8HM+7uZYX+e8cWO7vgVakQfCS1rReksM8Xd4vk8HS5SCsBJH3mTpB//NENdC/
bAppZ6hP5qXb0EYGA07wEYL1+US074GlSktEfOVFTZJNbtWYA/ePQl7i2fRJ8USz
Cq4J8w/svxYa2R5O70i3jy7wDAWpdDrGSN/d/6KvIKSGaIJ5YHwAhYut09onFYol
R4qxNsLRqYQqgOCs3dZmQxsWud8ejhwKxubdezvov8ruApI0K/I0YJhs51kEgpPs
3K1L6ziHT6BBK5RcyYcE9kPcarQB2x/kNIJyGcqAq5jDcJkdyvRsmoFAVNis+00x
6YLtK2e4UJM=
=iMQQ
-----END PGP PUBLIC KEY BLOCK-----
```
